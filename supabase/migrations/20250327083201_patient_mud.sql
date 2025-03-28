/*
  # Add notifications system

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users.id)
      - `type` (text) - e.g., 'message', 'rental_request', 'rental_status'
      - `content` (text)
      - `read` (boolean)
      - `created_at` (timestamp)
      - `related_id` (uuid) - Optional reference to related entity (message_id, rental_id, etc.)

  2. Security
    - Enable RLS
    - Users can only read their own notifications
    - System can insert notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  type text NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  related_id uuid,
  CONSTRAINT valid_type CHECK (type IN ('message', 'rental_request', 'rental_status'))
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create notification for new messages
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, content, related_id)
  VALUES (
    NEW.receiver_id,
    'message',
    'New message from ' || (SELECT email FROM users WHERE id = NEW.sender_id),
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new messages
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

-- Create function to automatically create notification for rental status changes
CREATE OR REPLACE FUNCTION create_rental_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify renter of status change
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, type, content, related_id)
    VALUES (
      NEW.renter_id,
      'rental_status',
      'Your rental request has been ' || NEW.status,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rental status changes
CREATE TRIGGER on_rental_status_change
  AFTER UPDATE ON rentals
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION create_rental_notification();