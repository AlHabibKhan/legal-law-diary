ALTER TABLE diary_entries ADD COLUMN reminder_minutes INTEGER;
ALTER TABLE diary_entries ADD COLUMN reminder_sent INTEGER NOT NULL DEFAULT 0;
