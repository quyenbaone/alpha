/*
  # Create equipment rental tables

  1. New Tables
    - `equipment`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `price` (numeric)
      - `category` (text)
      - `image` (text)
      - `location` (text)
      - `owner_id` (uuid, references auth.users)
      - `rating` (numeric)
      - `reviews` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `equipment` table
    - Add policies for:
      - Anyone can view equipment
      - Only authenticated owners can modify their equipment
*/

CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  category text NOT NULL,
  image text NOT NULL,
  location text NOT NULL,
  owner_id uuid REFERENCES auth.users NOT NULL,
  rating numeric DEFAULT 0,
  reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view equipment
CREATE POLICY "Anyone can view equipment"
  ON equipment
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert their own equipment
CREATE POLICY "Users can insert their own equipment"
  ON equipment
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Allow users to update their own equipment
CREATE POLICY "Users can update their own equipment"
  ON equipment
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Allow users to delete their own equipment
CREATE POLICY "Users can delete their own equipment"
  ON equipment
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);