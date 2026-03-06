-- Create storage bucket for game photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-photos',
  'game-photos',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
) ON CONFLICT (id) DO NOTHING;

-- Allow public read access to game photos
CREATE POLICY "Public read access for game photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-photos');

-- Allow anonymous uploads to game photos bucket
CREATE POLICY "Allow uploads to game photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'game-photos');

-- Allow updates to game photos
CREATE POLICY "Allow updates to game photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'game-photos');

-- Allow deletes from game photos
CREATE POLICY "Allow deletes from game photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'game-photos');
