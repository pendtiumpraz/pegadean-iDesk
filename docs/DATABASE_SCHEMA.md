# iDesk Compliance — Database Schema

Stack: MySQL (dev) / PostgreSQL (prod) + pgvector  
Konvensi: semua tabel ada `deleted_at` (SoftDeletes), `created_at`, `updated_at`

---

## 1. `users` — Pengguna

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
portal_user_id  BIGINT UNSIGNED NOT NULL UNIQUE        -- ID dari Portal SSO
name            VARCHAR(255) NOT NULL
email           VARCHAR(255) NOT NULL UNIQUE
nip             VARCHAR(30) NULL                        -- Nomor Induk Pegawai
jabatan         VARCHAR(255) NULL                       -- "KaDep CPP"
divisi          VARCHAR(255) NULL                       -- "Kepatuhan Perusahaan"
no_ekstensi     VARCHAR(20) NULL
avatar_initials VARCHAR(5) NULL                         -- computed "RH"
photo_path      VARCHAR(500) NULL
status          ENUM('aktif','cuti','non_aktif') DEFAULT 'aktif'
mfa_enabled     BOOLEAN DEFAULT FALSE
last_login_at   TIMESTAMP NULL
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 2. `roles` & Spatie Permission Tables (auto-generated)
Roles: `kadep_cpp`, `kadiv_kepatuhan`, `reviewer_cpp`, `tim_cpp`, `pic_aml`, `reviewer_junior`

---

## 3. `user_system_access` — Akses per Sistem Terintegrasi

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
user_id         BIGINT UNSIGNED NOT NULL FK users
system_name     VARCHAR(100) NOT NULL               -- BeComply, RCS, APASI, PERISAI, Semua
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 4. `policies` — Repository Kebijakan

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
code            VARCHAR(50) UNIQUE NOT NULL           -- KIMRK-4.2, POJK-18/2024
title           TEXT NOT NULL
type            ENUM('induk','anak','eksternal') NOT NULL
category        VARCHAR(100) NOT NULL                 -- GCG, AML-CFT, Manajemen Risiko, dll.
version         VARCHAR(20) NULL                      -- "4.2", "3.0"
effective_date  DATE NULL
status          ENUM('aktif','review','obsolete') DEFAULT 'aktif'
parent_id       BIGINT UNSIGNED NULL FK policies      -- self-referential hierarki
summary         TEXT NULL
excerpt         TEXT NULL                             -- kutipan pasal
pasal_ref       VARCHAR(255) NULL                     -- "Pasal 3, 7"
owner_div       VARCHAR(255) NULL
pengesah        VARCHAR(255) NULL
file_path       VARCHAR(500) NULL
linked_serkep_count INT UNSIGNED DEFAULT 0           -- cached count
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `code`, `type`, `category`, `status`, `parent_id`  
Note: Untuk pgvector semantic search, buat tabel `policy_embeddings` terpisah.

---

## 5. `policy_embeddings` — Vector Embeddings untuk AI Search

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
policy_id       BIGINT UNSIGNED NOT NULL FK policies
chunk_text      TEXT NOT NULL
embedding       VECTOR(1536) NULL                    -- pgvector (PostgreSQL only)
chunk_index     TINYINT UNSIGNED DEFAULT 0
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Note: Pada MySQL dev, skip embedding column — gunakan full-text search saja.

---

## 6. `serkeps` — Surat Edaran Kepatuhan

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
nomor           VARCHAR(30) NULL UNIQUE              -- SK-2026/0431 (setelah penomoran)
title           TEXT NOT NULL
jenis_naskah    ENUM('SERKEP','SE','SK','pedoman_kebijakan') NOT NULL
klasifikasi     ENUM('internal','terbatas','rahasia') DEFAULT 'internal'
status          ENUM('draft','review','kajian','approve','released') DEFAULT 'draft'
pemrakarsa_div  VARCHAR(255) NOT NULL                -- Divisi Pemrakarsa
effective_date  DATE NULL
version         TINYINT UNSIGNED DEFAULT 1
page_count      SMALLINT UNSIGNED NULL
replaces_id     BIGINT UNSIGNED NULL FK serkeps      -- Pengganti SERKEP lama
ai_risk_score   ENUM('high','med','low') NULL        -- AI-assigned
sla_due_at      TIMESTAMP NULL
submitted_at    TIMESTAMP NULL
signed_at       TIMESTAMP NULL
signer          VARCHAR(255) NULL
released_at     TIMESTAMP NULL
draft_file_path VARCHAR(500) NULL
final_file_path VARCHAR(500) NULL
created_by      BIGINT UNSIGNED NOT NULL FK users
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `nomor`, `status`, `pemrakarsa_div`, `ai_risk_score`, `sla_due_at`

---

## 7. `serkep_policies` — SERKEP ↔ Kebijakan Terkait (pivot)

```sql
serkep_id       BIGINT UNSIGNED NOT NULL FK serkeps
policy_id       BIGINT UNSIGNED NOT NULL FK policies
PRIMARY KEY (serkep_id, policy_id)
```

---

## 8. `review_tasks` — Workflow Step per SERKEP

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
serkep_id       BIGINT UNSIGNED NOT NULL FK serkeps
step            ENUM('pengajuan','review_kadep','review_cpp','kajian_hukum','pengesahan','penomoran','penerbitan') NOT NULL
step_order      TINYINT UNSIGNED NOT NULL             -- 1–7
status          ENUM('pending','current','done','skipped') DEFAULT 'pending'
assignee_id     BIGINT UNSIGNED NULL FK users
sla_due_at      TIMESTAMP NULL
started_at      TIMESTAMP NULL
completed_at    TIMESTAMP NULL
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `serkep_id`, `step`, `status`, `assignee_id`

---

## 9. `review_task_reviewers` — Reviewer per Step (pivot)

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
review_task_id  BIGINT UNSIGNED NOT NULL FK review_tasks
user_id         BIGINT UNSIGNED NOT NULL FK users
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 10. `disposisis` — Inbox Disposisi & Persetujuan

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
review_task_id  BIGINT UNSIGNED NOT NULL FK review_tasks
serkep_id       BIGINT UNSIGNED NOT NULL FK serkeps
from_user_id    BIGINT UNSIGNED NOT NULL FK users
to_user_id      BIGINT UNSIGNED NOT NULL FK users
title           VARCHAR(500) NOT NULL
preview         TEXT NULL
type            ENUM('approve','high','review','kajian') NOT NULL
is_urgent       BOOLEAN DEFAULT FALSE
is_read         BOOLEAN DEFAULT FALSE
body_html       TEXT NULL
decision        ENUM('approved','rejected','forwarded','clarification') NULL
decided_at      TIMESTAMP NULL
decision_note   TEXT NULL
sla_due_at      TIMESTAMP NULL
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `to_user_id`, `is_read`, `serkep_id`, `type`

---

## 11. `ai_reviews` — AI Co-pilot Review per SERKEP Version

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
serkep_id       BIGINT UNSIGNED NOT NULL FK serkeps
version         TINYINT UNSIGNED NOT NULL
analysis_duration_s INT UNSIGNED NULL               -- detik
total_findings  TINYINT UNSIGNED DEFAULT 0
total_suggestions TINYINT UNSIGNED DEFAULT 0
total_references TINYINT UNSIGNED DEFAULT 0
ai_model        VARCHAR(100) NULL                   -- "claude-3-5-sonnet"
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 12. `ai_findings` — Temuan AI per Review

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
ai_review_id    BIGINT UNSIGNED NOT NULL FK ai_reviews
finding_number  TINYINT UNSIGNED NOT NULL
severity        ENUM('high','med','low') NOT NULL
pasal_ref       VARCHAR(100) NULL                   -- "Pasal 7 ayat 2"
title           VARCHAR(500) NOT NULL
body            TEXT NOT NULL
quote           TEXT NULL                            -- kutipan dari dokumen
references_json JSON NULL                           -- ["POJK 18/2024 Pasal 14", "RCS-OPS-014"]
status          ENUM('pending','accepted','discussed','ignored') DEFAULT 'pending'
actioned_by     BIGINT UNSIGNED NULL FK users
actioned_at     TIMESTAMP NULL
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `ai_review_id`, `severity`, `status`

---

## 13. `compliance_risks` — Compliance Risk / RCSA

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
risk_code       VARCHAR(20) UNIQUE NOT NULL          -- RCS-OPS-014
category        ENUM('operasional','aml','ti','hukum','regulasi','fraud','strategis','reputasi') NOT NULL
description     TEXT NOT NULL
owner_div       VARCHAR(255) NOT NULL
likelihood      ENUM('tinggi','sedang','rendah') NOT NULL
impact          ENUM('tinggi','sedang','rendah') NOT NULL
inherent_score  TINYINT UNSIGNED NOT NULL            -- 1–25 (likelihood × impact)
residual_score  TINYINT UNSIGNED NOT NULL
control_count   TINYINT UNSIGNED DEFAULT 0
control_desc    TEXT NULL
pic_user_id     BIGINT UNSIGNED NULL FK users
target_date     DATE NULL
status          ENUM('aktif','mitigasi','monitor') DEFAULT 'aktif'
source          ENUM('BeComply','RCS','komite') DEFAULT 'RCS'
serkep_id       BIGINT UNSIGNED NULL FK serkeps
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `risk_code`, `category`, `status`, `inherent_score`, `residual_score`

---

## 14. `aml_alerts` — Alert Transaksi Mencurigakan (iDesk view)

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
transaction_id  VARCHAR(30) UNIQUE NOT NULL          -- TRX-YYYYMMDDNNNNN
waktu           TIMESTAMP NOT NULL
nasabah_masked  VARCHAR(255) NOT NULL                -- "N***** 0184"
tipe_transaksi  ENUM('tunai_keluar','transfer','penarikan_emas','setor_tunai','topup_emas') NOT NULL
nominal         VARCHAR(100) NOT NULL                -- Rp formatted string
skor            TINYINT UNSIGNED NOT NULL            -- 0–100
risk_level      ENUM('high','med','low') NOT NULL
alert_status    ENUM('EDD','STR_draft','tinjau','verifikasi') NOT NULL
tipologi        ENUM('structuring','cash_intensive','high_velocity','cross_border','pep_transactions') NULL
is_str_submitted BOOLEAN DEFAULT FALSE
source_system   VARCHAR(100) DEFAULT 'PERISAI'
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Note: Data ini di-pull dari AML/CFT app via API, bukan dikelola di iDesk.

---

## 15. `str_reports` — Suspicious Transaction Reports

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
aml_alert_id    BIGINT UNSIGNED NOT NULL FK aml_alerts
status          ENUM('draft','submitted','confirmed','rejected') DEFAULT 'draft'
submitted_at    TIMESTAMP NULL
submitted_by    BIGINT UNSIGNED NULL FK users
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 16. `watchlists` — Daftar Watchlist untuk iDesk view

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
source_name     VARCHAR(255) NOT NULL               -- "DTTOT BNPT"
entity_count    INT UNSIGNED DEFAULT 0
last_synced_at  TIMESTAMP NULL
update_type     ENUM('auto','manual') DEFAULT 'auto'
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 17. `integrations` — Sistem Terintegrasi

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
name            VARCHAR(100) UNIQUE NOT NULL         -- "BeComply", "RCS", dll.
description     TEXT NULL
status          ENUM('connected','limited','available') DEFAULT 'available'
last_sync_at    TIMESTAMP NULL
flows_json      JSON NULL                            -- ["SERKEP","RCS","Komitmen"]
config_json     JSON NULL                            -- connection config
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 18. `integration_pipelines` — Automation Pipeline

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
integration_id  BIGINT UNSIGNED NOT NULL FK integrations
name            VARCHAR(255) NOT NULL               -- "SERKEP baru → BeComply"
trigger_event   VARCHAR(255) NOT NULL               -- "serkep.created"
frequency       VARCHAR(100) NULL                   -- "Setiap komit", "1 menit"
is_active       BOOLEAN DEFAULT TRUE
last_run_at     TIMESTAMP NULL
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 19. `commitments` — Komitmen Kepatuhan

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
description     TEXT NOT NULL
status          ENUM('tercapai','on_track','terlambat') DEFAULT 'on_track'
target_quarter  VARCHAR(10) NULL                    -- "Q1", "Q2", dll.
serkep_id       BIGINT UNSIGNED NULL FK serkeps
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 20. `audit_logs` — Audit Trail (immutable)

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
actor_id        BIGINT UNSIGNED NULL FK users
actor_type      ENUM('user','system') DEFAULT 'user'
actor_name      VARCHAR(255) NULL                   -- cached
action          VARCHAR(500) NOT NULL
entity_type     VARCHAR(100) NULL
entity_id       VARCHAR(100) NULL
metadata_json   JSON NULL
created_at      TIMESTAMP
```
Note: TIDAK ADA `deleted_at` — audit log adalah immutable. Bisa pakai Spatie Activity Log.

---

## 21. `notifications` — Notifikasi

```sql
id              CHAR(36) PRIMARY KEY                -- UUID
user_id         BIGINT UNSIGNED NOT NULL FK users
event_type      VARCHAR(255) NOT NULL
title           VARCHAR(500) NOT NULL
body            TEXT NULL
is_read         BOOLEAN DEFAULT FALSE
read_at         TIMESTAMP NULL
action_url      VARCHAR(500) NULL
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 22. `user_notification_prefs` — Preferensi Notifikasi

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
user_id         BIGINT UNSIGNED NOT NULL FK users
event_type      VARCHAR(255) NOT NULL               -- "disposisi_baru", dll.
channel_email   BOOLEAN DEFAULT TRUE
channel_inapp   BOOLEAN DEFAULT TRUE
channel_whatsapp BOOLEAN DEFAULT FALSE
is_enabled      BOOLEAN DEFAULT TRUE
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Unique: `(user_id, event_type)`

---

## 23. `system_settings`

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
key             VARCHAR(255) UNIQUE NOT NULL
value           TEXT NULL
type            ENUM('string','boolean','integer','json') DEFAULT 'string'
group           VARCHAR(100) NULL
description     TEXT NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## Diagram Relasi (Ringkas)

```
serkeps ──< review_tasks (7 steps)
serkeps ──< serkep_policies (pivot ke policies)
serkeps ──< ai_reviews (1 per version)
serkeps ──< disposisis (many inbox items)
serkeps ──< commitments (optional)
serkeps >── serkeps (self: replaces_id)

review_tasks ──< disposisis (many)
review_tasks ──< review_task_reviewers (pivot ke users)

ai_reviews ──< ai_findings (many temuan)

policies >── policies (self: parent_id, hierarki)
policies ──< policy_embeddings (chunks untuk AI search)

compliance_risks >── serkeps (optional)
compliance_risks >── users (pic_user_id)

aml_alerts ──< str_reports (optional 1-to-1)

integrations ──< integration_pipelines (many)

users ──< disposisis (as from_user / to_user)
users ──< notifications (many)
users ──< user_notification_prefs (many)
users ──< ai_findings (as actioned_by)
```

---

## Soft Delete & Trash Policy

| Table | Soft Delete | Trash | Restore | Hard Delete |
|---|---|---|---|---|
| serkeps | ✓ | ✓ | ✓ | ✓ (admin) |
| policies | ✓ | ✓ | ✓ | ✓ (admin) |
| review_tasks | ✓ | ✓ | ✓ | ✓ |
| disposisis | ✓ | ✓ | ✓ | ✓ |
| ai_findings | ✓ | ✓ | ✓ | ✓ |
| compliance_risks | ✓ | ✓ | ✓ | ✓ |
| aml_alerts | ✓ | ✓ | ✓ | ✓ |
| commitments | ✓ | ✓ | ✓ | ✓ |
| users | ✓ | ✓ | ✓ | ✓ (super admin) |
| audit_logs | ✗ | ✗ | ✗ | ✗ (immutable, 10 years) |
