/*
  # Update users table for rental functionality

  1. Changes
    - Add rental-specific fields to users table
    - Add verification fields
    - Update RLS policies for rental users
    - Add triggers for rental verification

  2. Security
    - Enable RLS
    - Add appropriate policies for rental access
*/

-- Add rental-specific fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS business_name text,
ADD COLUMN IF NOT EXISTS business_address text,
ADD COLUMN IF NOT EXISTS tax_number text,
ADD COLUMN IF NOT EXISTS bank_account text,
ADD COLUMN IF NOT EXISTS rental_rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS rental_reviews integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rental_verified_at timestamptz,
ADD COLUMN IF NOT EXISTS rental_documents jsonb;

-- Add indexes for rental fields
CREATE INDEX IF NOT EXISTS users_rental_rating_idx ON users (rental_rating);
CREATE INDEX IF NOT EXISTS users_rental_verified_idx ON users (rental_verified_at);

-- Update RLS policies for rental users
DROP POLICY IF EXISTS "Renters can insert their own equipment" ON equipment;
CREATE POLICY "Renters can insert their own equipment"
ON equipment
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = owner_id AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (
      (is_renter = true AND rental_verified_at IS NOT NULL)
      OR is_admin = true
    )
  )
);

DROP POLICY IF EXISTS "Renters can update their own equipment" ON equipment;
CREATE POLICY "Renters can update their own equipment"
ON equipment
FOR UPDATE
TO authenticated
USING (
  auth.uid() = owner_id AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (
      (is_renter = true AND rental_verified_at IS NOT NULL)
      OR is_admin = true
    )
  )
)
WITH CHECK (
  auth.uid() = owner_id AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (
      (is_renter = true AND rental_verified_at IS NOT NULL)
      OR is_admin = true
    )
  )
);

DROP POLICY IF EXISTS "Renters can delete their own equipment" ON equipment;
CREATE POLICY "Renters can delete their own equipment"
ON equipment
FOR DELETE
TO authenticated
USING (
  auth.uid() = owner_id AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (
      (is_renter = true AND rental_verified_at IS NOT NULL)
      OR is_admin = true
    )
  )
);

-- Update verify_renter function to handle verification
CREATE OR REPLACE FUNCTION verify_renter()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_renter = true AND OLD.is_renter = false THEN
    -- Set verification timestamp
    NEW.rental_verified_at := CURRENT_TIMESTAMP;
    
    -- Create notification for user
    INSERT INTO notifications (
      user_id,
      type,
      content,
      related_id
    ) VALUES (
      NEW.id,
      'rental_status',
      'Tài khoản của bạn đã được cấp quyền cho thuê thiết bị',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add function to update rental rating
CREATE OR REPLACE FUNCTION update_rental_rating()
RETURNS trigger AS $$
BEGIN
  -- Update average rating and review count for rental user
  UPDATE users
  SET 
    rental_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM equipment
      WHERE owner_id = NEW.owner_id
    ),
    rental_reviews = (
      SELECT COALESCE(SUM(reviews), 0)
      FROM equipment
      WHERE owner_id = NEW.owner_id
    )
  WHERE id = NEW.owner_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updating rental rating
CREATE TRIGGER on_equipment_rating_change
  AFTER INSERT OR UPDATE OF rating, reviews ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_rating();

-- Add function to validate rental documents
CREATE OR REPLACE FUNCTION validate_rental_documents()
RETURNS trigger AS $$
BEGIN
  -- Check if required documents are present
  IF NEW.is_renter = true AND (
    NEW.business_name IS NULL OR
    NEW.business_address IS NULL OR
    NEW.tax_number IS NULL OR
    NEW.bank_account IS NULL OR
    NEW.rental_documents IS NULL
  ) THEN
    RAISE EXCEPTION 'Missing required rental information';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for validating rental documents
CREATE TRIGGER before_rental_verification
  BEFORE UPDATE OF is_renter ON users
  FOR EACH ROW
  WHEN (OLD.is_renter IS DISTINCT FROM NEW.is_renter)
  EXECUTE FUNCTION validate_rental_documents();

-- Update admin audit log to include rental changes
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    INSERT INTO admin_audit_logs (
      admin_id,
      action,
      target_table,
      target_id,
      details
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object(
        'old_data', to_jsonb(OLD),
        'new_data', to_jsonb(NEW),
        'changed_at', now(),
        'rental_status', CASE
          WHEN NEW.is_renter IS DISTINCT FROM OLD.is_renter THEN
            CASE WHEN NEW.is_renter THEN 'approved' ELSE 'revoked' END
          ELSE NULL
        END
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;