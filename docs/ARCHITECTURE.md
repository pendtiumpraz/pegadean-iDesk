# App 3 — iDesk 2.0 (Compliance Desk)

## 1. Tujuan
**Roadmap Digitalisasi Tata Kelola Divisi Kepatuhan** — mempercepat, mengakuratkan, mentransparankan, dan mempertanggungjawabkan proses **review dan penerbitan kebijakan (SERKEP)** Pegadaian, dibantu **AI** yang terintegrasi.

## 2. Framework (dari PDF)

**Compliance Blueprint**:
- RJPP, RKAP, CPP, KPI → input strategis
- Tata Kelola Kebijakan + Regulatory Internal & Eksternal + Kepatuhan Perusahaan
- GCG, AML-CFT

**Output**: Budaya Kepatuhan, Compliance Risk, Kesesuaian Kebijakan, Monitoring Komitmen, Penerapan APU-PPT

**Legacy Apps (akan di-replace)**:
| App | Fungsi |
|---|---|
| **BeComply** | Repositori Kebijakan |
| **RCS** | Monitoring Kepatuhan Hukum |
| **APASI** | Pelaporan Gratifikasi |
| **SIMPEL** | Monitoring Kewajiban Pelaporan |
| **PERISAI** | Monitoring Risiko APU-PPT |

## 3. Alur Proses Tinjauan Kepatuhan (SERKEP Workflow)

```
Divisi Pemrakarsa → Pengajuan → KaDiv → KaDep CPP → Tim CPP Review
     │                                                    │
  Drafting                                          Review Naskah
    Awal                                                  │
                                                   Hasil Kajian
                                                          │
                                           Pengajuan SERKEP
                                                          │
                                           Pengesahan → Penomoran → Rilis
```

## 4. Improvement Point
1. **KECEPATAN** — Proses review cepat dibantu AI
2. **AKURASI** — Review akurat via AI + regulatory database
3. **TRANSPARANSI** — Atasan pantau proses real-time
4. **AKUNTABILITAS** — Hasil dipertanggungjawabkan

## 5. Modul iDesk 2.0

| Modul | Fungsi |
|---|---|
| **Policy Drafting Studio** | TipTap editor, version history, template |
| **Review Workflow** | Pipeline SERKEP, SLA per step, disposisi digital |
| **AI Compliance Review** | Gap analysis vs regulasi, deteksi conflict, suggestion |
| **SERKEP Management** | Penomoran otomatis, e-signature (Peruri BSrE), abstraksi AI |
| **Policy Repository** | Full-text + semantic search, tagging, relasi antar kebijakan |
| **Meeting Management** | Schedule klarifikasi, MS Teams/Zoom integration |
| **Monitoring Dashboard** | Status SERKEP, bottleneck, KPI |
| **Berita Acara** | Digital minutes, e-sign, attach ke SERKEP |

## 6. Arsitektur (Laravel 12 + Inertia + React)

```
┌──────────────────────────────────────────────────┐
│         WEB APP (Inertia + React + TipTap)        │
│  Drafting Studio │ Workflow │ Repository │ Dash   │
└────────────────────┬─────────────────────────────┘
                     │ SSO Token (Portal)
                     ▼
┌──────────────────────────────────────────────────┐
│              LARAVEL APPLICATION                  │
│                                                   │
│  Services:                                       │
│  ├── PolicyService (CRUD, versioning, diff)      │
│  ├── WorkflowService (Spatie Model States)       │
│  ├── AIService (gap analysis, abstraksi, RAG)    │
│  ├── SerkepService (penomoran, e-sign)           │
│  ├── SearchService (full-text + pgvector)        │
│  └── NotificationService                         │
│                                                   │
│  Routes: /web (Inertia) + /api/v1 (REST)         │
│  Queue: AI review jobs, PDF generation            │
│  Stancl/Tenancy: multi-DB, BYODB                 │
└──────┬────────────────┬──────────────────────────┘
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│ PostgreSQL  │  │   Redis     │
│ + pgvector  │  │ cache/queue │
│ (per tenant)│  │             │
└─────────────┘  └─────────────┘
```

**Integrations**: Portal SSO, i-GRaCiaS (policy lifecycle API), AML/CFT (procedure API), BeComply (migration), RCS (regulatory feed), Peruri BSrE (e-sign), MS Teams/Zoom, AI API (OpenAI/Gemini/Claude)

## 7. Data Model
- `policy_draft(id, title, type[KU|PD|SE], divisi_pemrakarsa, current_version, status)`
- `policy_version(id, policy_id, version_no, content_json, author, diff_summary)`
- `review_task(id, policy_id, step, assignee, sla_due, status)` — Spatie Model States
- `disposisi(id, review_task_id, from_user, to_user, note, decision)`
- `ai_review(id, policy_version_id, prompt, gap_findings, suggestions, confidence)`
- `serkep(id, policy_id, nomor, signed_at, signer, abstraksi_ai, file_url)`
- `berita_acara(id, serkep_id, meeting_id, minutes_url, participants)`
- `policy_embedding(id, policy_id, chunk_text, embedding_vector)` — pgvector
- `audit_log(...)` — Spatie Activity Log, immutable

## 8. AI Integration (via HTTP API)

### Gap Analysis Use Case
- **Input**: Draft kebijakan baru
- **Context (RAG)**: Regulasi (OJK, BI, PPATK) + existing policies + precedent
- **Output**: Konflik regulasi, gap, saran redaksional, abstraksi, kesesuaian kebijakan induk/anak
- **Provider**: OpenAI/Gemini/Claude via HTTP Client Laravel
- **Vector DB**: pgvector (same PostgreSQL instance, no extra service)

Embedding pipeline: Laravel Queue job → chunk text → call embedding API → store in pgvector

## 9. Non-Functional
| Aspek | Target |
|---|---|
| Concurrent editors | 200 |
| AI review latency | p95 < 30 s |
| Search policy | p95 < 500 ms |
| Availability | 99.5% |
| Retention | Permanent (aktif) + 10 tahun (obsolete) |
| Document integrity | SHA-256 hash + e-sign (Peruri BSrE) |

## 10. Security
- SSO via Portal (OAuth2)
- Document-level ACL (Spatie Permission — divisi-based)
- PII masking sebelum kirim ke AI API
- E-signature legal-grade (Peruri BSrE — sah UU ITE)
- Watermark PDF kebijakan published
- Tenant data isolation (Stancl/Tenancy)
