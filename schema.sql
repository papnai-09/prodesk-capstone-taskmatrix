CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    due_date TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for matching user_id" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert for matching user_id" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for matching user_id" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for matching user_id" ON public.tasks FOR DELETE USING (true);
