-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, equipment_id)
);

-- Create helpful_reviews table to track which users found which reviews helpful
CREATE TABLE IF NOT EXISTS public.helpful_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, review_id)
);

-- Create function to increment helpful count
CREATE OR REPLACE FUNCTION public.increment_helpful_count(review_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if the user has already marked this review as helpful
  IF EXISTS (SELECT 1 FROM public.helpful_reviews WHERE user_id = v_user_id AND review_id = increment_helpful_count.review_id) THEN
    RETURN;
  END IF;
  
  -- Insert record into helpful_reviews
  INSERT INTO public.helpful_reviews (user_id, review_id)
  VALUES (v_user_id, increment_helpful_count.review_id);
  
  -- Increment the helpful_count in the reviews table
  UPDATE public.reviews
  SET helpful_count = COALESCE(helpful_count, 0) + 1
  WHERE id = increment_helpful_count.review_id;
END;
$$;

-- Create RLS policies for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read reviews
CREATE POLICY "Everyone can read reviews" 
ON public.reviews FOR SELECT 
USING (true);

-- Users can create their own reviews
CREATE POLICY "Users can create their own reviews" 
ON public.reviews FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews" 
ON public.reviews FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews" 
ON public.reviews FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create RLS policies for helpful_reviews
ALTER TABLE public.helpful_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read helpful_reviews
CREATE POLICY "Everyone can read helpful_reviews" 
ON public.helpful_reviews FOR SELECT 
USING (true);

-- Users can create their own helpful_reviews
CREATE POLICY "Users can create their own helpful_reviews" 
ON public.helpful_reviews FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS reviews_equipment_id_idx ON public.reviews(equipment_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS helpful_reviews_review_id_idx ON public.helpful_reviews(review_id);
CREATE INDEX IF NOT EXISTS helpful_reviews_user_id_idx ON public.helpful_reviews(user_id); 