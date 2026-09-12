-- ESE DIGITALS — PHASE 4 / G9.6
-- Worker-native opportunity intelligence persistence.
-- No fabricated seed data is inserted by this migration.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS job_sources (
  source_id TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  base_url TEXT,
  api_url TEXT,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0,1)),
  last_run TEXT,
  last_success TEXT,
  rate_limit_notes TEXT,
  verification_rule TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS jobs (
  job_id TEXT PRIMARY KEY,
  source_id TEXT,
  source_type TEXT,
  source_name TEXT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  department TEXT,
  role_family TEXT,
  description TEXT,
  location TEXT,
  remote_type TEXT,
  eligible_countries TEXT,
  eligible_regions TEXT,
  excluded_countries TEXT,
  work_authorization TEXT,
  timezone TEXT,
  employment_type TEXT,
  salary_min REAL,
  salary_max REAL,
  currency TEXT,
  posted_date TEXT,
  updated_date TEXT,
  first_seen TEXT,
  last_verified TEXT,
  application_url TEXT,
  source_url TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  eligibility_status TEXT NOT NULL DEFAULT 'UNCLEAR',
  eligibility_reason TEXT,
  freshness_status TEXT NOT NULL DEFAULT 'STALE',
  verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED',
  content_hash TEXT NOT NULL UNIQUE,
  match_keywords TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (source_id) REFERENCES job_sources(source_id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS job_evidence (
  evidence_id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  evidence_type TEXT NOT NULL,
  claim TEXT NOT NULL,
  evidence_text TEXT,
  evidence_url TEXT,
  observed_at TEXT NOT NULL,
  confidence TEXT NOT NULL DEFAULT 'low',
  reviewer TEXT NOT NULL DEFAULT 'automated',
  created_at TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_profiles (
  profile_id TEXT PRIMARY KEY,
  email TEXT,
  country TEXT,
  city TEXT,
  timezone TEXT,
  work_authorization TEXT,
  remote_preference TEXT,
  role_families TEXT,
  custom_titles TEXT,
  skills TEXT,
  experience TEXT,
  employment_type TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_active_eligibility
  ON jobs(active, eligibility_status);

CREATE INDEX IF NOT EXISTS idx_jobs_source
  ON jobs(source_id, source_type);

CREATE INDEX IF NOT EXISTS idx_jobs_freshness
  ON jobs(active, freshness_status, last_verified);

CREATE INDEX IF NOT EXISTS idx_jobs_remote
  ON jobs(active, remote_type);

CREATE INDEX IF NOT EXISTS idx_jobs_role_family
  ON jobs(active, role_family);

CREATE INDEX IF NOT EXISTS idx_jobs_company
  ON jobs(active, company);

CREATE INDEX IF NOT EXISTS idx_evidence_job
  ON job_evidence(job_id, evidence_type);

-- FTS5 is used for bounded keyword retrieval instead of full-table LIKE scans.
CREATE VIRTUAL TABLE IF NOT EXISTS jobs_fts USING fts5(
  job_id UNINDEXED,
  title,
  company,
  department,
  role_family,
  description,
  location,
  match_keywords,
  content=''
);

CREATE TRIGGER IF NOT EXISTS jobs_ai AFTER INSERT ON jobs BEGIN
  INSERT INTO jobs_fts(rowid, job_id, title, company, department, role_family, description, location, match_keywords)
  VALUES (new.rowid, new.job_id, new.title, new.company, new.department, new.role_family, new.description, new.location, new.match_keywords);
END;

CREATE TRIGGER IF NOT EXISTS jobs_au AFTER UPDATE ON jobs BEGIN
  DELETE FROM jobs_fts WHERE rowid = old.rowid;
  INSERT INTO jobs_fts(rowid, job_id, title, company, department, role_family, description, location, match_keywords)
  VALUES (new.rowid, new.job_id, new.title, new.company, new.department, new.role_family, new.description, new.location, new.match_keywords);
END;

CREATE TRIGGER IF NOT EXISTS jobs_ad AFTER DELETE ON jobs BEGIN
  DELETE FROM jobs_fts WHERE rowid = old.rowid;
END;
