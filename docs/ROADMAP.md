# Roadmap — iDesk 2.0

**Durasi total: 8 bulan** — paling cepat dari 3 app, karena scope fokus + high ROI.
**Stack: Laravel 12 + Inertia.js + React 18 + PostgreSQL 15**
**Alasan dibangun awal**: Policy repository adalah **fondasi** yang dikonsumsi AML/CFT dan i-GRaCiaS.

---

## Fase 0 — Preparation (Bulan 0, 3 minggu)
- Business Analysis — mapping proses SERKEP existing
- Gathering Document — template SE, KU, PD, contoh berita acara, regulasi aktif
- Brain Storming with Developer — AI stack feasibility, e-sign vendor (Peruri BSrE)
- Setup Laravel 12 + Inertia.js + React + TipTap + Stancl/Tenancy

## Fase 1 — Core Policy Repository + Workflow (Bulan 1–3)
**Goal: workflow SERKEP digital end-to-end tanpa AI**
- SSO integration dengan Portal (OAuth2)
- RBAC (Spatie Permission): Divisi Pemrakarsa, KaDiv, KaDep CPP, Tim CPP, Atasan
- **Policy Drafting Studio** — TipTap editor, versioning, diff viewer (React + Inertia)
- **Review Workflow** — Spatie Model States (Drafting → Kajian → Review → SERKEP → Pengesahan → Rilis)
- Disposisi digital
- Berita Acara Klarifikasi + arrange meeting online (MS Teams integration)
- Notification (email + in-app)
- Repository v1 (list + filter + PostgreSQL full-text search)
- REST API `/api/v1/` parallel
- **Deliverable**: 1 divisi pilot jalankan 1 SERKEP full-digital

## Fase 2 — AI Review Engine (Bulan 3–5)
**Goal: AI-assisted compliance review (KECEPATAN + AKURASI)**
- pgvector extension setup di PostgreSQL
- Ingest existing policies → embed → pgvector (via Laravel Queue job)
- Ingest regulatory feed → embed + metadata
- **AI Gap Analysis**: draft vs regulasi + kebijakan induk/anak (OpenAI/Gemini API)
- **AI Redaksional Suggestion** — rewrite kalimat konflik
- **AI Abstraksi** — ringkasan kebijakan otomatis
- UI: side-panel AI suggestions inline dalam TipTap editor
- Privacy masking layer sebelum kirim ke AI
- **Deliverable**: Review kebijakan turun dari 2 minggu → 3 hari

## Fase 3 — Repository Lengkap + BeComply Migration (Bulan 4–6)
**Goal: iDesk jadi single source of truth**
- **Migrasi data BeComply** → iDesk (ETL script + validasi)
- Semantic search (pgvector + AI embeddings)
- Relasi antar kebijakan (induk → turunan, revisi, obsolete)
- Obsolete tracking — auto-flag saat regulasi dicabut
- Export PDF + watermark + e-sign (Peruri BSrE)
- API publish untuk i-GRaCiaS & AML/CFT (internal API)
- **Deliverable**: BeComply freeze, semua divisi pakai iDesk

## Fase 4 — Monitoring Dashboard & KPI (Bulan 6–7)
**Goal: TRANSPARANSI + AKUNTABILITAS**
- Dashboard KaDep CPP: SERKEP in-progress, bottleneck, SLA breach (Recharts)
- Dashboard Direksi: trend regulasi, kepatuhan coverage
- Personal inbox: tugas review, SLA countdown
- Activity log per SERKEP (Spatie Activity Log)
- **Deliverable**: Atasan pantau real-time

## Fase 5 — Rollout Enterprise (Bulan 7–8)
- Finalisasi RBAC semua divisi
- Deploy all divisi
- Training user: 2 batch × 30 peserta
- DR drill + backup test
- BYODB/BYOS implementation (Stancl/Tenancy)
- Whitelabel branding (CSS variables)
- **Deliverable**: iDesk 2.0 GA production, SaaS ready

## Post-Launch (Bulan 8+)
- Integrasi i-GRaCiaS (policy lifecycle M5)
- AI Assistant Q&A regulasi ("boleh tidak X menurut POJK Y?")
- Smart template: AI generate draft awal dari prompt
- Analytics: regulasi paling sering di-cite, policy paling diakses

---

## Milestone KPI
| Bulan | KPI |
|---|---|
| 3 | 1 divisi pilot, 1 SERKEP full-digital |
| 5 | AI review turunkan waktu review 75% |
| 6 | 100% kebijakan di iDesk (BeComply migrated) |
| 7 | Dashboard real-time aktif |
| 8 | All divisi onboarded, SaaS ready |

## Risiko & Mitigasi
| Risiko | Mitigasi |
|---|---|
| Kualitas AI untuk regulasi Indonesia | RAG ketat + human-in-the-loop (saran, bukan auto-reject) |
| Data sensitif ke AI cloud | Masking + enterprise endpoint, atau on-prem LLM (opsional) |
| Resistensi Divisi Pemrakarsa | Change mgmt + quick win: AI draft assist |
| E-sign legal validity | Peruri BSrE (sah UU ITE) |
| Migrasi BeComply legacy | ETL tim dedicated + validasi sample |

## Sinergi dengan App Lain
- **AML/CFT** → konsumsi prosedur APU-PPT dari iDesk (source of truth)
- **i-GRaCiaS M5** → thin wrapper di atas iDesk API
- Satu kebijakan ter-revisi di iDesk = auto-propagate ke GRC & AML via API
