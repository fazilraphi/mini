-- Add the doctor_license column to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS doctor_license TEXT;
