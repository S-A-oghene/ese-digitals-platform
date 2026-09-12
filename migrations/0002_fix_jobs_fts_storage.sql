-- Replace the initial contentless FTS definition with a normal FTS5 table.
-- This allows the Worker to retrieve job_id directly from the FTS match set.

DROP TRIGGER IF EXISTS jobs_ai;
DROP TRIGGER IF EXISTS jobs_au;
DROP TRIGGER IF EXISTS jobs_ad;
DROP TABLE IF EXISTS jobs_fts;

CREATE VIRTUAL TABLE jobs_fts USING fts5(
  job_id UNINDEXED,
  title,
  company,
  department,
  role_family,
  description,
  location,
  match_keywords
);

CREATE TRIGGER jobs_ai AFTER INSERT ON jobs BEGIN
  INSERT INTO jobs_fts(rowid, job_id, title, company, department, role_family, description, location, match_keywords)
  VALUES (new.rowid, new.job_id, new.title, new.company, new.department, new.role_family, new.description, new.location, new.match_keywords);
END;

CREATE TRIGGER jobs_au AFTER UPDATE ON jobs BEGIN
  DELETE FROM jobs_fts WHERE rowid = old.rowid;
  INSERT INTO jobs_fts(rowid, job_id, title, company, department, role_family, description, location, match_keywords)
  VALUES (new.rowid, new.job_id, new.title, new.company, new.department, new.role_family, new.description, new.location, new.match_keywords);
END;

CREATE TRIGGER jobs_ad AFTER DELETE ON jobs BEGIN
  DELETE FROM jobs_fts WHERE rowid = old.rowid;
END;

-- Backfill the FTS index for jobs that may already exist when this migration runs.
INSERT INTO jobs_fts(rowid, job_id, title, company, department, role_family, description, location, match_keywords)
SELECT rowid, job_id, title, company, department, role_family, description, location, match_keywords
FROM jobs;
