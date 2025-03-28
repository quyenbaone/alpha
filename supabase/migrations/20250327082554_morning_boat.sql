/*
  # Create rentals table

  1. New Tables
    - `rentals`
      - `id` (uuid, primary key)
      - `equipment_id` (uuid, references equipment)
      - `renter_id` (uuid, references auth.users)
      - `start_date` (date)
      - `end_date` (date)
      - `status` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `rentals` table
    - Add policies for:
      - Users can view their own rentals
      - Equipment owners can view rentals of their equipment
      - Users can create rental requests
      - Equipment owners can update rental status
*/

CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid REFERENCES equipment NOT NULL,
  renter_id uuid REFERENCES auth.users NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own rentals
CREATE POLICY "Users can view their own rentals"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = renter_id);

-- Allow equipment owners to view rentals of their equipment
CREATE POLICY "Equipment owners can view rentals of their equipment"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM equipment
      WHERE equipment.id = rentals.equipment_id
      AND equipment.owner_id = auth.uid()
    )
  );

-- Allow authenticated users to create rental requests
CREATE POLICY "Users can create rental requests"
  ON rentals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = renter_id
    AND status = 'pending'
  );

-- Allow equipment owners to update rental status
CREATE POLICY "Equipment owners can update rental status"
  ON rentals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM equipment
      WHERE equipment.id = rentals.equipment_id
      AND equipment.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM equipment
      WHERE equipment.id = rentals.equipment_id
      AND equipment.owner_id = auth.uid()
    )
  );