CREATE TABLE IF NOT EXISTS lawyer_profile (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  bar_council TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  mobile_number TEXT NOT NULL,
  chamber_address TEXT,
  practice_areas TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO app_settings (key, value) VALUES ('pin_hash', '');
INSERT OR IGNORE INTO app_settings (key, value) VALUES ('is_registered', 'false');
INSERT OR IGNORE INTO app_settings (key, value) VALUES ('app_locked', 'false');

CREATE TABLE IF NOT EXISTS courts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  level TEXT NOT NULL,
  parent_id TEXT,
  city TEXT,
  province TEXT,
  address TEXT,
  phone TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS judges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT,
  court_id TEXT NOT NULL,
  bench TEXT,
  from_date TEXT,
  to_date TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (court_id) REFERENCES courts(id)
);

CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  case_number TEXT NOT NULL,
  title TEXT NOT NULL,
  case_type TEXT,
  court_id TEXT,
  judge_id TEXT,
  filing_date TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  description TEXT,
  remarks TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (court_id) REFERENCES courts(id),
  FOREIGN KEY (judge_id) REFERENCES judges(id)
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cnic TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS case_parties (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  client_id TEXT,
  party_type TEXT NOT NULL,
  party_name TEXT,
  is_client INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS diary_entries (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  date TEXT NOT NULL,
  court_id TEXT,
  judge_id TEXT,
  purpose TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Scheduled',
  remarks TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (court_id) REFERENCES courts(id),
  FOREIGN KEY (judge_id) REFERENCES judges(id)
);

CREATE TABLE IF NOT EXISTS proceedings (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  date TEXT NOT NULL,
  proceeding_type TEXT,
  order_summary TEXT,
  next_date TEXT,
  remarks TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  file_path TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  case_id TEXT,
  title TEXT NOT NULL,
  datetime TEXT NOT NULL,
  is_recurring INTEGER NOT NULL DEFAULT 0,
  recurring_interval TEXT,
  is_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);
