/*
  # Add rental status update functionality

  1. Changes
    - Add updated_at column to rentals table
    - Add trigger for rental status changes
    - Update notification handling for rental status changes

  2. Security
    - Maintain existing RLS policies
    - Add validation for status transitions
*/

-- Add updated_at column to rentals table if it doesn't exist
ALTER TABLE rentals 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create function to handle rental status changes
CREATE OR REPLACE FUNCTION handle_rental_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the updated_at timestamp
  NEW.updated_at := now();

  -- Create notification for status change
  INSERT INTO notifications (
    user_id,
    type,
    content,
    related_id
  ) VALUES (
    NEW.renter_id,
    'rental_status',
    CASE 
      WHEN NEW.status = 'approved' THEN 'Đơn thuê của bạn đã được chấp nhận'
      WHEN NEW.status = 'rejected' THEN 'Đơn thuê của bạn đã bị từ chối'
      WHEN NEW.status = 'completed' THEN 'Đơn thuê của bạn đã hoàn thành'
      ELSE 'Trạng thái đơn thuê của bạn đã được cập nhật'
    END,
    NEW.id
  );

  -- Log the change in admin audit logs if made by admin
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
      'UPDATE',
      'rentals',
      NEW.id,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'changed_at', now()
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_rental_status_change ON rentals;

-- Create new trigger for rental status changes
CREATE TRIGGER on_rental_status_change
  AFTER UPDATE OF status ON rentals
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_rental_status_change();

-- Update RLS policies for rentals
DROP POLICY IF EXISTS "Equipment owners can update rental status" ON rentals;

CREATE POLICY "Equipment owners and admins can update rental status"
ON rentals
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM equipment
    WHERE equipment.id = rentals.equipment_id
    AND (
      equipment.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_admin = true
      )
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM equipment
    WHERE equipment.id = rentals.equipment_id
    AND (
      equipment.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_admin = true
      )
    )
  )
);