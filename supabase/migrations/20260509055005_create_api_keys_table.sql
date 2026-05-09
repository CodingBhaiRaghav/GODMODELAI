/*
  # Create API Keys Table

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `session_id` (text, unique identifier for anonymous sessions)
      - `groq_api_key` (text, encrypted Groq API key)
      - `google_api_key` (text, encrypted Google API key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `api_keys` table
    - Add policy for anonymous users to read/write their own keys
    - Keys are tied to a session ID rather than user authentication
*/

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  groq_api_key text,
  google_api_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own API keys"
  ON api_keys
  FOR SELECT
  USING (session_id = current_setting('app.current_session_id', true));

CREATE POLICY "Users can insert their own API keys"
  ON api_keys
  FOR INSERT
  WITH CHECK (session_id = current_setting('app.current_session_id', true));

CREATE POLICY "Users can update their own API keys"
  ON api_keys
  FOR UPDATE
  USING (session_id = current_setting('app.current_session_id', true))
  WITH CHECK (session_id = current_setting('app.current_session_id', true));
