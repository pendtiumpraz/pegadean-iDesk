# iDesk — Compliance Workspace

**iDesk** adalah workspace digital untuk Divisi Kepatuhan PT Pegadaian. Fokus pada _policy lifecycle management_, review SERKEP (Surat Edaran/Keputusan), disposisi & approval flow, AI-assisted document analysis, dan compliance monitoring terpadu.

Tema: **iDesk Compliance Workspace** — warm ink scale + brand green oklch + IBM Plex Serif untuk document headings + dedicated AI Co-pilot panel.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 12, PHP 8.2+ |
| Frontend | Inertia.js v3, React 18 |
| Build | Vite 7, Tailwind CSS v4 |
| Database | MySQL 8 |
| Typography | Inter (UI), **IBM Plex Serif** (document body), JetBrains Mono (codes) |
| Auth | Local + Portal SSO |
| Routing helper | Ziggy v2 |

---

## Modul Utama

### Beranda
1. **Dashboard** — KPI grid (SERKEP Aktif / Tugas Review / AI Akurasi / Risiko Tinggi), 2-col layout dengan queue table + AI Co-pilot card + Disposisi list, 3-col bottom dengan bar-chart + donut + heatmap.
2. **Disposisi & Persetujuan** — **Inbox split-pane**: list di kiri dengan InboxItem (sender Avatar, time, title, preview, pill+SLA tag, unread dot) + detail di kanan dengan serif h2 title, pill row, dashed PDF attachment card, brand AISuggestionCallout, 4-button footer (Tolak / Disposisi / Klarifikasi / Sahkan & Terbitkan).

### Tinjauan Kepatuhan
3. **Tinjauan SERKEP** — Daftar SERKEP dengan ChipFilter workflow stages (Semua·42 / Drafting·8 / Review CPP·12 / Kajian / Pengesahan / Terbit) + right-aligned chips (Pemrakarsa / Risiko / SLA). DataTable dengan `.doc-id` mono code, color-coded jenis Tag, AvatarStack reviewers, SLA chip color-coded.
4. **Tinjauan SERKEP Detail** _(signature page)_ — **DocShell 3-column layout**:
   - **TOC pane** (220px): vertical Stepper menampilkan workflow (Pengajuan → Review Kadep → Review CPP → Kajian Hukum → Pengesahan → Penomoran → Penerbitan) + Daftar Isi clickable
   - **DocPaper** (center fluid): IBM Plex Serif body dengan eyebrow + title + meta + Pasal sections, reviewer AvatarStack di header
   - **AIPanel** (320px): 4-tab AI Co-pilot (Temuan / Saran / Rujukan / Tanya AI) dengan AICard per finding (severity pill, brand-bordered quote, accept/discuss/ignore actions)
5. **Tugas Review** — Inbox-style review queue dengan filter chips. Detail pane dengan AISuggestionCallout, dashed PDF attachment, completion form.
6. **AI Review** — AI Co-pilot results sebagai 2-col card grid. Each card: linked policy/serkep title + Donut score (color-coded <40 rose, <70 amber, ≥70 brand) + summary + status pill + model Tag mono. Detail page render `issues_json` sebagai AICard list.

### Repository & Monitoring
7. **Repository Kebijakan** — ChipFilter dengan counts (Semua·336 / Induk·28 / Anak·219 / Eksternal·89 + categories). DataTable dengan Kode mono, Tipe color-coded, Versi mono, Tertaut SERKEP count. Plus **Pemetaan Hierarki** (tree induk→anak→turunan dengan `└` ASCII indent) + **Dampak Perubahan Regulasi** (left-border colored alerts).
8. **Compliance Risk** — Risk register kepatuhan dengan inherent vs residual L×I tracking. KPI grid + Heatmap per Divisi + Kategori Risiko HBar + ChipFilter + DataTable.
9. **APU/PPT (AML/CFT)** — Read-only view alert dari sistem AML utama (sinkron 15 menit). KPI grid dengan Sparkline + Watchlist & Sanksi sync card + Alert per Tipologi HBar.
10. **Pelaporan STR** — STR (Suspicious Transaction Report) workspace. Submit ke PPATK action dengan AISuggestionCallout untuk klasifikasi indikasi otomatis.
11. **Komitmen** — Commitment tracker (regulasi/internal/audit/lainnya). Donut overall completion + Top 5 Pemilik HBar + ChipFilter + DataTable dengan Progress HBar dan deadline overdue red.
12. **Monitoring** — Compliance monitoring & analytics dashboard:
    - 4 KPI: Total Tx 30 Hari / Suspicious / Pending STR / Risk Score Aggregate
    - 2-col: Suspicious Transactions 30-day SVG line chart + Top Risk mini-table
    - 3-col: Compliance Index per Divisi (HBar) + Action Plan Donut + Recent Disposisi
    - Aktivitas Hari Ini Timeline
    - **Export KPMR** (CSV stream)

### Sistem
13. **Integrasi** — 8 integrated systems grid (BeComply / RCS / APASI / SIMPEL / PERISAI / E-Office / PPATK / OJK):
    - Each card: icon + name + category Tag + status dot + last_sync mono + Health Score HBar
    - Animated **Data Flow Pipeline** (External Sources → iDesk → Downstream PPATK/OJK) dengan CSS keyframe pulse
    - API & Webhook Config card dengan mono code block + copy buttons
14. **Pengaturan** — Tabbed sidebar layout (Profile / Tim & Peran / AI Co-pilot / Notifikasi / Security / Appearance / **Audit Trail**). Audit Trail tab punya ChipFilter action types + search + vertical Timeline.

---

## Signature Features

### AI Search Modal (Cmd+K / Ctrl+K)
Global keyboard shortcut membuka **AISearchModal** — centered overlay dengan IBM Plex Serif input, suggestion list, recent queries, quick-access grid.

### DocShell + AI Co-pilot Panel
Pattern signature untuk Serkep/Show: 3-column layout (TOC | DocPaper serif body | AIPanel) dengan AI findings sebagai AICard berstruktur.

### Inbox Split-Pane
Pattern email-like untuk Disposisi & TugasReview dengan AISuggestionCallout + dashed PDF attachment card + action button row.

### AIGradientBanner / AISuggestionCallout
Brand-bordered AI suggestion blocks dengan sparkle icon.

---

## Authentication

Hybrid: lokal + Portal SSO.

### Default Users (setelah `db:seed`)

| Email | Password | Jabatan | Divisi |
|-------|----------|---------|--------|
| `policy.owner@idesk.pegadaian.co.id` | `Password123!` | Policy Owner | Kepatuhan |
| `reviewer@idesk.pegadaian.co.id` | `Password123!` | Reviewer | Kepatuhan |
| `compliance.desk@idesk.pegadaian.co.id` | `Password123!` | Compliance Analyst | Kepatuhan |

User memiliki kolom `jabatan`, `divisi`, `no_ekstensi`, `photo_path`, `status` enum('aktif','cuti','non_aktif'), `mfa_enabled`.

---

## Setup

### Prerequisites
- PHP 8.2+, MySQL 8, Node 20+
- Database: `idesk_compliance_dev`
- Portal app di `http://localhost:8000`

### Install

```bash
git clone https://github.com/pendtiumpraz/pegadean-iDesk.git
cd pegadean-iDesk

composer install --ignore-platform-req=ext-sodium
cp .env.example .env
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force

npm install --legacy-peer-deps
npm run build

php artisan serve --port=8003
```

Set Portal SSO di `.env`:
```
PORTAL_URL=http://localhost:8000
PORTAL_CLIENT_ID=<dari portal>
PORTAL_CLIENT_SECRET=<dari portal>
PORTAL_REDIRECT_URI=http://localhost:8003/auth/portal/callback
```

### Development
```bash
npm run dev
http://localhost:8003/login
```

---

## Domain Model — Tabel Utama

| Tabel | Deskripsi |
|-------|-----------|
| `policies` | Kebijakan dengan tipe (induk/anak/eksternal), versi, AI Score, parent_id (hierarki) |
| `serkep` | SERKEP dengan workflow stage, jenis_naskah, klasifikasi, replaces_id |
| `review_tasks` | Tugas review dengan jenis_dokumen, deadline, completed_at |
| `disposisi` | Flow disposisi serkep dengan dari_user / kepada_user / instruksi / catatan_balasan |
| `ai_reviews` | AI review hasil (score, issues_json, recommendations_json, model_used) |
| `compliance_risks` | Risiko kepatuhan dengan inherent + residual L×I |
| `aml_alerts` | Read-only mirror dari AML app (sync 15 menit) |
| `str_reports` | STR submisi ke PPATK |
| `commitments` | Tracker komitmen (regulasi/internal/audit/lainnya) dengan progress_pct |
| `integrations` | 8 sistem integrated dengan health_score, last_sync_at, config_json |
| `audit_logs` | Audit trail aktivitas sistem |

---

## Reference Design Identity

iDesk menggunakan reference design resmi:
- Brand: oklch green `--brand-700: oklch(0.32 0.07 155)` darker, `--brand-600` primary
- Gold accent untuk highlights dan tags
- Warm ink scale dengan `--paper` (white) + `--canvas` (off-white)
- IBM Plex Serif untuk doc-paper body & display titles
- Layered shadows: `0 4px 14px -4px rgba(20,30,20,0.10)` md / `0 18px 40px -16px rgba(20,30,20,0.18)` lg

Built dari reference styles.css + shell.jsx + dashboard.jsx + serkep-doc.jsx + screens.jsx + ai-search.jsx.

---

## Architecture Notes

- **Folder render path**: controller render `Inertia::render('Policy/Index')` → `Pages/Policy/Index.jsx`. Folder Inggris (Policy, Commitment, ComplianceRisk, AmlAlert, StrReport, ReviewTask), route prefix Indonesia (`/kebijakan`, `/komitmen`, `/risiko-kepatuhan`, `/aml-alerts`, `/str`, `/tugas-review`)
- **AISearchModal global**: `useEffect` keyboard listener di AppLayout mendeteksi Cmd+K / Ctrl+K. Topbar `.global-search` is read-only input yang membuka modal on click/focus
- **DocShell layout** untuk Serkep/Show — 3-column grid dengan `.doc-shell` wrapper, configurable column widths, IBM Plex Serif untuk body
- **Inertia shared**: auth.user (id, name, nip, jabatan, divisi, avatar_initials, photo_path, status, mfa_enabled), flash, ziggy

---

## Related Apps

Bagian dari **Pegadean Compliance Platform**:
- [pegadean-portal](https://github.com/pendtiumpraz/pegadean-portal) — SSO Server + Tenant Admin (port 8000)
- [pegadaian-aml-cft](https://github.com/pendtiumpraz/pegadaian-aml-cft) — APU/PPT AML/CFT (port 8001)
- [pegadaian-iGRaCias](https://github.com/pendtiumpraz/pegadaian-iGRaCias) — Integrated GRC Information System (port 8002)

---

## License

Proprietary — PT Pegadaian (Persero). Internal use only.
