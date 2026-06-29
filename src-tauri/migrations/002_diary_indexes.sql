-- Performance indexes for diary queries
CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON diary_entries(date);
CREATE INDEX IF NOT EXISTS idx_diary_entries_case ON diary_entries(case_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_status ON diary_entries(status);
CREATE INDEX IF NOT EXISTS idx_proceedings_case ON proceedings(case_id);
CREATE INDEX IF NOT EXISTS idx_proceedings_date ON proceedings(date);
CREATE INDEX IF NOT EXISTS idx_documents_case ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_court ON cases(court_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(datetime);
