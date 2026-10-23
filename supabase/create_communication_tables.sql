-- CyberSec LMS Communication & Notifications Tables
-- Run this script in your Supabase SQL Editor

-- Just in case they already exist with wrong types
DROP TABLE IF EXISTS public.direct_messages CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;

-- 1. Direct Messages Table
CREATE TABLE public.direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT NOT NULL, 
    receiver_id TEXT NOT NULL, -- UUID or 'BROADCAST'
    sender_name TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Direct Messages
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Policies for Direct Messages
CREATE POLICY "Allow users to read their own messages or broadcasts" 
ON public.direct_messages FOR SELECT 
USING (
    auth.uid()::text = sender_id 
    OR auth.uid()::text = receiver_id 
    OR receiver_id = 'BROADCAST'
);

CREATE POLICY "Allow users to send messages" 
ON public.direct_messages FOR INSERT 
WITH CHECK (auth.uid()::text = sender_id);

CREATE POLICY "Allow users to mark their messages as read" 
ON public.direct_messages FOR UPDATE 
USING (auth.uid()::text = receiver_id);


-- 2. Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- UUID or 'BROADCAST'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    time TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for Notifications
CREATE POLICY "Allow users to read their notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid()::text = user_id OR user_id = 'BROADCAST');

CREATE POLICY "Allow system to insert notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (true); -- In a real prod app, you might restrict this to service_role

CREATE POLICY "Allow users to mark notifications as read" 
ON public.notifications FOR UPDATE 
USING (auth.uid()::text = user_id);
