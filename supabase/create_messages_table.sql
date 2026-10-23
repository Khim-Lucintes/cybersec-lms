CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read their own messages" ON public.direct_messages;
CREATE POLICY "Allow users to read their own messages" 
ON public.direct_messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Allow users to send messages" ON public.direct_messages;
CREATE POLICY "Allow users to send messages" 
ON public.direct_messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Allow users to mark messages as read" ON public.direct_messages;
CREATE POLICY "Allow users to mark messages as read" 
ON public.direct_messages FOR UPDATE 
USING (auth.uid() = receiver_id);
