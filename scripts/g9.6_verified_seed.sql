-- ESE DIGITALS — G9.6 CONTROLLED VERIFIED SEED
-- Sources verified from original employer ATS pages on 2026-09-12.
-- This file contains real opportunities only. No fabricated records.
-- Controlled/admin ingestion only; never expose this path through the public Worker.

INSERT OR IGNORE INTO job_sources (source_id, source_name, source_type, base_url, api_url, enabled, verification_rule, created_at, updated_at)
VALUES
('src-ashby-scale-army', 'Scale Army Careers', 'ASHBY', 'https://jobs.ashbyhq.com/Scale%20Army%20Careers', NULL, 1, 'Original Ashby employer/client application page verified during ingestion.', '2026-09-12T00:00:00Z', '2026-09-12T00:00:00Z'),
('src-ashby-global-talent', 'The Global Talent Co.', 'ASHBY', 'https://jobs.ashbyhq.com/the-global-talent-co', NULL, 1, 'Original Ashby application page verified during ingestion.', '2026-09-12T00:00:00Z', '2026-09-12T00:00:00Z'),
('src-ashby-mkopa', 'M-KOPA', 'ASHBY', 'https://jobs.ashbyhq.com/M-KOPA', NULL, 1, 'Original Ashby application page verified during ingestion.', '2026-09-12T00:00:00Z', '2026-09-12T00:00:00Z');

INSERT OR IGNORE INTO jobs (
  job_id, source_id, source_type, source_name, title, company, department, role_family,
  description, location, remote_type, eligible_countries, eligible_regions, excluded_countries,
  work_authorization, timezone, employment_type, salary_min, salary_max, currency,
  posted_date, updated_date, first_seen, last_verified, application_url, source_url,
  active, eligibility_status, eligibility_reason, freshness_status, verification_status,
  content_hash, match_keywords, created_at, updated_at
) VALUES
(
  'g96-scale-admin-operations-assistant', 'src-ashby-scale-army', 'ASHBY', 'Scale Army Careers',
  'Admin and Operations Assistant', 'Scale Army Careers', 'Technology & Product', 'Operations',
  'Remote contract operations role open to candidates in Nigeria and other listed regions. Supports leadership across operational and administrative priorities, end-to-end process ownership, coordination, fulfillment, and process execution.',
  'Nigeria', 'REMOTE', '["Nigeria"]', '["Africa"]', '[]',
  'Nigeria eligible per original listing location set', 'US business hours', 'CONTRACT', 1500, 2200, 'USD',
  NULL, NULL, '2026-09-12T00:00:00Z', '2026-09-12T00:00:00Z',
  'https://jobs.ashbyhq.com/Scale%20Army%20Careers/90c7c568-2f70-404f-9f2b-5ba5c7f468b8',
  'https://jobs.ashbyhq.com/Scale%20Army%20Careers/90c7c568-2f70-404f-9f2b-5ba5c7f468b8',
  1, 'CONFIRMED', 'Original Ashby page explicitly lists Nigeria; remote contract role.', 'CURRENT', 'VERIFIED',
  'ea17ebe5c33699b4c1a4aea6a97b44e1dde7b6b37924f0650c74f2d3463b5f93', 'operations, administrative, process, coordination, fulfillment, project coordination',
  '2026-09-12T00:00:00Z', '2026-09-12T00:00:00Z'
),
(
  'g96-scale-flight-operations-coordinator', 'src-ashby-scale-army', 'ASHBY', 'Scale Army Careers',
  'Flight Operations Coordinator', 'Scale Army Careers', 'Operations', 'Operations',
  'Remote contract role open to candidates in Nigeria and other listed regions. Coordinates private aircraft operations, logistics, stakeholders, documentation, scheduling, vendors, and operational records.',
  'Nigeria', 'REMOTE', '["Nigeria"]', '["Africa"]', '[]',
  'Nigeria eligible per original listing location set', 'US business hours', 'CONTRACT', 1500, 2500, 'USD',
  NULL, NULL, '2026-09-12T00:00:00Z', '2026-09-12T00:00:00Z',
  'https://jobs.ashbyhq.com/scale%20Army%20Careers/1a9876c8-b351-4a81-9fca-81d7526d28c7',
  'https://jobs.ashbyhq.com/scale%20Army%20Careers/1a9876c8-b351-4a81-9fca-81d7526d28c7',
  1, 'CONFIRMED', 'Original Ashby page explicitly lists Nigeria; remote contract role.', 'CURRENT', 'VERIFIED',
  'e85eeb70664cad0f6affe62a8d0099d68bc6bb094d5eedc230ccf1b25a755ffc', 'flight operations, operations, logistics, coordination, scheduling, documentation, vendors',
  '2026-09-12T00:00:00Z', '2026-09-12T00:00:00Z'
),
(
  'g96-scale-financial-systems-ai', 'src-ashby-scale-army', 'ASHBY', 'Scale Army Careers',
  'Financial Systems & AI Automation Specialist', 'Scale Army Careers', 'Technology & Product', 'Operations',
  'Remote contract role open to candidates in Nigeria and other listed regions. Leads AI-driven workflows across finance, operations, scheduling, and data management, with implementation, integration, training, and process optimization responsibilities.',
  'Nigeria', 'REMOTE', '["Nigeria"]', '["Africa"]', '[]',
  'Nigeria eligible per original listing location set', 'US business hours', 'CONTRACT', 2000, 3000, 'USD',
  NULL, NULL, '2026-09-12T00:00:00Z', '2026-09-12T00:00:00Z',
  'https://jobs.ashbyhq.com/Scale%20Army%20Careers/5c280bcd-d621-4ba7-a8f8-cae25b6d60f2',
  'https://jobs.ashbyhq.com/Scale%20Army%20Careers/5c280bcd-d621-4ba7-a8f8-cae25b6d60f2',
  1, 'CONFIRMED', 'Original Ashby page explicitly lists Nigeria; remote contract role.', 'CURRENT', 'VERIFIED',
  '0c37efb157cca5d9392616bdb02585f22ba4f31e5c374cde4d83d2d5a2db601f', 'AI automation, operations, workflow, systems, integration, process optimization, project management',
  '2026-09-12T00:00:00Z', '2026-09-12T00:00:00Z'
),
(
  'g96-global-talent-marketing-ops', 'src-ashby-global-talent', 'ASHBY', 'The Global Talent Co.',
  'Marketing Operations Manager (AI & Automation)', 'The Global Talent Co.', 'Admin & Support Functions', 'Marketing Operations',
  'Full-time remote role explicitly listing Nigeria. Builds AI-powered marketing systems, automates complex workflows, improves operational processes, implements solutions, and measures business impact.',
  'Nigeria', 'REMOTE', '["Nigeria"]', '["Africa"]', '[]',
  'Nigeria eligible per original listing location set', 'CET', 'FULL-TIME', NULL, NULL, NULL,
  NULL, NULL, '2026-09-12T00:00:00Z', '2026-09-12T00:00:00Z',
  'https://jobs.ashbyhq.com/the-global-talent-co/07800dd7-062e-4adc-a0bc-bc09b40cd97e/',
  'https://jobs.ashbyhq.com/the-global-talent-co/07800dd7-062e-4adc-a0bc-bc09b40cd97e/',
  1, 'CONFIRMED', 'Original Ashby page lists Nigeria and remote location type.', 'CURRENT', 'VERIFIED',
  'abf96f6b6f2f612652a60a07375a0c07b4286211ad86fac75e8b7474608d0142', 'marketing operations, AI, automation, CRM operations, workflow optimization, process design, operations',
  '2026-09-12T00:00:00Z', '2026-09-12T00:00:00Z'
),
(
  'g96-mkopa-workplace-officer', 'src-ashby-mkopa', 'ASHBY', 'M-KOPA',
  'Workplace Officer', 'M-KOPA', 'Corporate Workplaces', 'Workplace Operations',
  'Full-time on-site Lagos role in Nigeria. Runs day-to-day workplace services, fleet and transport, local travel, facilities, inventory, vendor coordination, airtime/data administration, and event logistics.',
  'Lagos, Nigeria', 'ON-SITE', '["Nigeria"]', '["Lagos"]', '[]',
  'Nigeria on-site role', 'Africa/Lagos', 'FULL-TIME', NULL, NULL, NULL,
  NULL, NULL, '2026-09-12T00:00:00Z', '2026-09-12T00:00:00Z',
  'https://jobs.ashbyhq.com/M-KOPA/2e599191-c4f7-4572-bc37-baa5d6ec9907',
  'https://jobs.ashbyhq.com/M-KOPA/2e599191-c4f7-4572-bc37-baa5d6ec9907',
  1, 'CONFIRMED', 'Original Ashby page lists Lagos and on-site location type.', 'CURRENT', 'VERIFIED',
  '433de1cbaa20a8c51b6833f932b2f0089673d7e12c35b2e753a92124e1265c7c', 'workplace operations, facilities, logistics, vendor coordination, inventory, travel, administration',
  '2026-09-12T00:00:00Z', '2026-09-12T00:00:00Z'
);

INSERT OR IGNORE INTO job_evidence (evidence_id, job_id, evidence_type, claim, evidence_text, evidence_url, observed_at, confidence, reviewer, created_at)
VALUES
('ev-g96-001', 'g96-scale-admin-operations-assistant', 'ELIGIBILITY', 'Nigeria eligible', 'Original Ashby listing explicitly includes Nigeria in its location set and identifies the role as Remote.', 'https://jobs.ashbyhq.com/Scale%20Army%20Careers/90c7c568-2f70-404f-9f2b-5ba5c7f468b8', '2026-09-12T00:00:00Z', 'high', 'g9.6-verified-seed', '2026-09-12T00:00:00Z'),
('ev-g96-002', 'g96-scale-flight-operations-coordinator', 'ELIGIBILITY', 'Nigeria eligible', 'Original Ashby listing explicitly includes Nigeria in its location set and identifies the role as Remote.', 'https://jobs.ashbyhq.com/scale%20Army%20Careers/1a9876c8-b351-4a81-9fca-81d7526d28c7', '2026-09-12T00:00:00Z', 'high', 'g9.6-verified-seed', '2026-09-12T00:00:00Z'),
('ev-g96-003', 'g96-scale-financial-systems-ai', 'ELIGIBILITY', 'Nigeria eligible', 'Original Ashby listing explicitly includes Nigeria in its location set and identifies the role as Remote.', 'https://jobs.ashbyhq.com/Scale%20Army%20Careers/5c280bcd-d621-4ba7-a8f8-cae25b6d60f2', '2026-09-12T00:00:00Z', 'high', 'g9.6-verified-seed', '2026-09-12T00:00:00Z'),
('ev-g96-004', 'g96-global-talent-marketing-ops', 'ELIGIBILITY', 'Nigeria eligible', 'Original Ashby listing explicitly lists Nigeria and Remote as the location configuration.', 'https://jobs.ashbyhq.com/the-global-talent-co/07800dd7-062e-4adc-a0bc-bc09b40cd97e/', '2026-09-12T00:00:00Z', 'high', 'g9.6-verified-seed', '2026-09-12T00:00:00Z'),
('ev-g96-005', 'g96-mkopa-workplace-officer', 'ELIGIBILITY', 'Nigeria/Lagos eligible', 'Original Ashby listing specifies Lagos, Nigeria and On-site location type.', 'https://jobs.ashbyhq.com/M-KOPA/2e599191-c4f7-4572-bc37-baa5d6ec9907', '2026-09-12T00:00:00Z', 'high', 'g9.6-verified-seed', '2026-09-12T00:00:00Z');
