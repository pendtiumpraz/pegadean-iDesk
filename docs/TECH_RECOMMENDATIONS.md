# Rekomendasi Tech Stack — iDesk 2.0

**Stack: Laravel 12 + Inertia.js + React 18 + PostgreSQL 15**

Ini adalah 1 dari 4 app dalam platform compliance Pegadaian.
Keempat app (Portal, iDesk, i-GRaCiaS, AML/CFT) menggunakan **tech stack yang sama**.

**Karakter aplikasi**: document-centric, rich editor, workflow approval, AI/LLM integration, e-signature, search-heavy. Users ~1.000 (Divisi Pemrakarsa + CPP + Atasan).

---

## Tech Stack

### Backend: Laravel 12 + PHP 8.4
- **Auth**: SSO via Portal (OAuth2/Passport) + Sanctum session
- **RBAC**: Spatie Permission — role: Divisi Pemrakarsa, KaDiv, KaDep CPP, Tim CPP, Atasan
- **Workflow**: Spatie Model States (state machine SERKEP lifecycle)
- **Queue**: Laravel Queue + Redis (AI review jobs, PDF generation, notification)
- **Tenancy**: Stancl/Tenancy (multi-database, BYODB)
- **Audit**: Spatie Activity Log (immutable, WORM)
- **HTTP Client**: AI API calls (OpenAI/Gemini/Claude) untuk gap analysis & review
- **E-Sign**: Peruri BSrE API integration (legal-binding UU ITE)
- **Reporting**: DomPDF (PDF SERKEP + watermark)
- **Search**: PostgreSQL full-text search + pgvector extension (RAG untuk policy search)

### Frontend: React 18 + Inertia.js + TypeScript
- **Rich Editor**: TipTap (best collaborative editor — dipakai GitLab, Linear)
- **UI**: Ant Design / Shadcn UI
- **Styling**: Tailwind CSS + CSS variables (whitelabel)
- **Table**: TanStack Table (policy repository list)
- **Charts**: Recharts (monitoring dashboard)
- **Forms**: React Hook Form + Zod (multi-step workflow)

### Database: PostgreSQL 15
- JSONB untuk content kebijakan terstruktur (pasal, ayat, lampiran)
- Full-text search untuk pencarian kebijakan & regulasi
- **pgvector** extension untuk AI RAG (semantic search policy)
- Per-tenant database (Stancl/Tenancy) — BYODB ready

### AI Integration (via HTTP API, bukan Python service terpisah)
- **Gap Analysis**: Draft baru vs regulasi + kebijakan induk/anak
- **Redaksional Suggestion**: AI rewrite kalimat bermasalah
- **Abstraksi**: Executive summary otomatis
- **Policy Search**: Semantic search via pgvector + AI API
- **Provider**: OpenAI GPT-4o / Gemini / Claude via HTTP

---

## Kenapa Tetap Laravel (bukan Next.js+Supabase / Payload CMS / Django+Wagtail)?

| Kriteria | Laravel + Inertia + React ✅ | Next.js + Supabase (old rec) | Django + Wagtail |
|---|---|---|---|
| **Konsistensi** | ✅ Sama dengan 3 app lain | ❌ Beda stack total | ❌ Beda stack total |
| **Auth** | ✅ SSO Portal shared | ⚠️ Supabase Auth ≠ Portal | ⚠️ Perlu bridge |
| **Tenancy** | ✅ Stancl/Tenancy | ⚠️ Manual RLS | ⚠️ django-tenants |
| **Rich Editor** | ✅ TipTap (React) | ✅ TipTap (React) | ⚠️ Wagtail editor |
| **AI** | ✅ HTTP Client | ✅ Python service | ✅ Native Python |
| **RAG/Vector** | ✅ pgvector (sama DB) | ✅ pgvector | ✅ pgvector |
| **E-Sign** | ✅ HTTP Client | ✅ Node SDK | ✅ requests |
| **Talent** | ✅ Shared tim | ❌ Perlu Node dev | ❌ Perlu Python dev |

**Alasan utama**: Konsistensi platform > fitur spesifik satu app.
AI tetap bisa diakses via HTTP API dari Laravel tanpa perlu Python service terpisah.

---

## Shared Composer Packages

```
pegadaian/auth-client      → SSO token validation ke Portal
pegadaian/tenant-core      → Stancl/Tenancy config, BYODB
pegadaian/ai-service       → AI API wrapper (gap analysis, abstraksi, RAG)
pegadaian/branding         → Whitelabel theming
pegadaian/audit-trail      → Activity logging standard
```

---

## REST API (Parallel)

```
/api/v1/policies           → Policy CRUD, versioning
/api/v1/reviews            → Review workflow management
/api/v1/serkep             → SERKEP lifecycle
/api/v1/search             → Full-text + semantic search
/api/v1/ai/gap-analysis    → AI gap analysis endpoint
/api/v1/ai/abstraksi       → AI executive summary
```

Consumed by: i-GRaCiaS (M5 policy reference), AML/CFT (procedure reference), whitelabel clients.
