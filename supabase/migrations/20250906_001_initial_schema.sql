-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE case_status AS ENUM (
  'nouveau',
  'en_cours', 
  'repondu',
  'resolu',
  'ferme'
);

CREATE TYPE case_category AS ENUM (
  'blessure_aile',
  'blessure_patte',
  'emmele',
  'comportement_anormal',
  'oisillon',
  'autre'
);

CREATE TYPE sender_type AS ENUM ('user', 'expert');

-- Create tables
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location GEOGRAPHY(POINT),
  address TEXT,
  status case_status DEFAULT 'nouveau',
  category case_category,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_type sender_type NOT NULL,
  sender_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE case_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_created_at ON cases(created_at);
CREATE INDEX idx_messages_case_id ON messages(case_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_case_photos_case_id ON case_photos(case_id);
CREATE INDEX idx_case_photos_message_id ON case_photos(message_id);

-- Spatial index for location queries
CREATE INDEX idx_cases_location ON cases USING GIST(location);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cases_updated_at 
  BEFORE UPDATE ON cases 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cases
CREATE POLICY "Users can view their own cases" ON cases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cases" ON cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cases" ON cases
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages for their cases" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = messages.case_id 
      AND cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages for their cases" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = messages.case_id 
      AND cases.user_id = auth.uid()
    )
  );

-- RLS Policies for case_photos
CREATE POLICY "Users can view photos for their cases" ON case_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = case_photos.case_id 
      AND cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos for their cases" ON case_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = case_photos.case_id 
      AND cases.user_id = auth.uid()
    )
  );

-- Create storage bucket for case photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('case-photos', 'case-photos', true);

-- Storage policies
CREATE POLICY "Users can upload photos for their cases" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'case-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Photos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'case-photos');

CREATE POLICY "Users can update photos for their cases" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'case-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete photos for their cases" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'case-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );