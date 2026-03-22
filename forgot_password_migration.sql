-- =====================================================
-- CRITICAL: Enable Realtime on chat_messages table
-- This is required for real-time chat to work!
-- Without this, postgres_changes subscriptions are silent.
-- =====================================================
-- Run this FIRST in the Supabase SQL Editor:

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- If you get "relation already exists" error, that's fine — it means it's already enabled.

-- Also enable Realtime on profiles (for presence features)
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Ensure profiles has a last_seen column for online/offline fallback
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;

-- =====================================================
-- Create the forgot_password table for manual password reset requests
-- =====================================================

CREATE TABLE IF NOT EXISTS forgot_password (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'pending'
);

-- Enable Row Level Security (RLS)
ALTER TABLE forgot_password ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to INSERT (users submitting requests)
CREATE POLICY "Anyone can submit a forgot password request"
ON forgot_password
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Allow authenticated admins to SELECT all
CREATE POLICY "Admins can view all forgot password requests"
ON forgot_password
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated admins to UPDATE status
CREATE POLICY "Admins can update forgot password requests"
ON forgot_password
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create an index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_forgot_password_status ON forgot_password(status);

-- Create an index on email for faster searching
CREATE INDEX IF NOT EXISTS idx_forgot_password_email ON forgot_password(email);
