# iDesk Compliance — Backend Implementation Plan

Stack: Laravel 12 + Inertia.js + React 18 + MySQL (dev) / PostgreSQL + pgvector (prod)  
Port dev: `http://localhost:8003`  
Auth: SSO via Portal OAuth2

---

## 1. Composer Packages

```json
{
  "require": {
    "inertiajs/inertia-laravel": "^3.1",
    "spatie/laravel-permission": "^6.0",
    "spatie/laravel-activitylog": "^4.0",
    "spatie/laravel-model-states": "^2.0",
    "spatie/laravel-data": "^4.0",
    "barryvdh/laravel-dompdf": "^3.0",
    "guzzlehttp/guzzle": "^7.0"
  }
}
```

---

## 2. Eloquent Models

| Model | Traits | Key Relations |
|---|---|---|
| `User` | SoftDeletes, HasFactory | hasMany(Serkep), hasMany(Disposisi), hasMany(ReviewTask), hasMany(Notification) |
| `Policy` | SoftDeletes, HasFactory | belongsTo(Policy, 'parent_id'), hasMany(Policy, 'parent_id'), hasMany(PolicyEmbedding), belongsToMany(Serkep) |
| `PolicyEmbedding` | — | belongsTo(Policy) |
| `Serkep` | SoftDeletes, HasFactory, LogsActivity | hasMany(ReviewTask), hasMany(Disposisi), hasOne(AiReview), belongsToMany(Policy), belongsTo(User, 'created_by'), hasMany(Commitment) |
| `ReviewTask` | SoftDeletes | belongsTo(Serkep), belongsTo(User, 'assignee_id'), hasMany(Disposisi), belongsToMany(User, 'review_task_reviewers') |
| `Disposisi` | SoftDeletes | belongsTo(ReviewTask), belongsTo(Serkep), belongsTo(User, 'from_user_id'), belongsTo(User, 'to_user_id') |
| `AiReview` | — | belongsTo(Serkep), hasMany(AiFinding) |
| `AiFinding` | SoftDeletes | belongsTo(AiReview), belongsTo(User, 'actioned_by') |
| `ComplianceRisk` | SoftDeletes, HasFactory | belongsTo(User, 'pic_user_id'), belongsTo(Serkep) |
| `AmlAlert` | SoftDeletes | hasOne(StrReport) |
| `StrReport` | SoftDeletes | belongsTo(AmlAlert) |
| `Watchlist` | SoftDeletes | — |
| `Integration` | SoftDeletes | hasMany(IntegrationPipeline) |
| `IntegrationPipeline` | SoftDeletes | belongsTo(Integration) |
| `Commitment` | SoftDeletes | belongsTo(Serkep) |
| `Notification` | SoftDeletes | belongsTo(User) |
| `UserNotificationPref` | SoftDeletes | belongsTo(User) |
| `AuditLog` | — (immutable) | belongsTo(User, 'actor_id') |
| `SystemSetting` | — | — |

---

## 3. Routes (`routes/web.php`)

```php
// Dashboard
GET /dashboard                                  → DashboardController@index

// Disposisi & Inbox
GET    /inbox                                   → InboxController@index
GET    /inbox/{disposisi}                       → InboxController@show
POST   /inbox/{disposisi}/decide                → InboxController@decide
POST   /inbox/{disposisi}/forward               → InboxController@forward

// SERKEP
GET    /serkep                                  → SerkepController@index
GET    /serkep/trash                            → SerkepController@trash
GET    /serkep/create                           → SerkepController@create
POST   /serkep                                  → SerkepController@store
GET    /serkep/{serkep}                         → SerkepController@show      # dokumen reviewer
PUT    /serkep/{serkep}                         → SerkepController@update
DELETE /serkep/{serkep}                         → SerkepController@destroy
POST   /serkep/{serkep}/restore                 → SerkepController@restore
DELETE /serkep/{serkep}/force                   → SerkepController@forceDelete
POST   /serkep/{serkep}/advance                 → SerkepController@advanceStep
POST   /serkep/{serkep}/reject                  → SerkepController@reject
POST   /serkep/{serkep}/request-clarification   → SerkepController@requestClarification
POST   /serkep/{serkep}/approve                 → SerkepController@approve
POST   /serkep/{serkep}/publish                 → SerkepController@publish
POST   /serkep/{serkep}/upload-draft            → SerkepController@uploadDraft
GET    /serkep/{serkep}/ai-review               → AiReviewController@show
POST   /serkep/{serkep}/ai-review/trigger       → AiReviewController@trigger
POST   /serkep/{serkep}/ai-review/findings/{f}/action → AiReviewController@action

// Repository Kebijakan
GET    /repository                              → PolicyController@index
GET    /repository/trash                        → PolicyController@trash
GET    /repository/{policy}                     → PolicyController@show
POST   /repository                              → PolicyController@store
PUT    /repository/{policy}                     → PolicyController@update
DELETE /repository/{policy}                     → PolicyController@destroy
POST   /repository/{policy}/restore             → PolicyController@restore
DELETE /repository/{policy}/force               → PolicyController@forceDelete
GET    /repository/{policy}/versions            → PolicyController@versions
POST   /repository/ai-search                    → PolicyController@aiSearch      # Cmd+K search

// Monitoring
GET    /monitoring                              → MonitoringController@index

// Compliance Risk
GET    /risk                                    → ComplianceRiskController@index
GET    /risk/trash                              → ComplianceRiskController@trash
POST   /risk                                    → ComplianceRiskController@store
PUT    /risk/{risk}                             → ComplianceRiskController@update
DELETE /risk/{risk}                             → ComplianceRiskController@destroy
POST   /risk/{risk}/restore                     → ComplianceRiskController@restore
DELETE /risk/{risk}/force                       → ComplianceRiskController@forceDelete

// AML-CFT
GET    /aml                                     → AmlController@index
POST   /aml/{alert}/create-str                  → AmlController@createStr
PUT    /aml/str/{str}                           → AmlController@updateStr
POST   /aml/str/{str}/submit                    → AmlController@submitStr

// Integrations
GET    /integrations                            → IntegrationController@index
POST   /integrations/{integration}/sync        → IntegrationController@sync
GET    /integrations/audit-log                  → IntegrationController@auditLog

// Settings
GET    /settings                                → SettingController@index
POST   /settings/profile                        → SettingController@updateProfile
POST   /settings/team                           → SettingController@inviteTeam
PUT    /settings/team/{user}                    → SettingController@updateTeamMember
DELETE /settings/team/{user}                    → SettingController@removeTeamMember
POST   /settings/ai-copilot                     → SettingController@updateAiCopilot
POST   /settings/notifications                  → SettingController@updateNotifications
POST   /settings/security                       → SettingController@updateSecurity
GET    /settings/audit-trail                    → SettingController@auditTrail

// Notifications
GET    /notifications                           → NotificationController@index
POST   /notifications/{n}/read                  → NotificationController@markRead
POST   /notifications/mark-all-read            → NotificationController@markAllRead
DELETE /notifications/{n}                       → NotificationController@destroy

// API
POST   /api/v1/auth/validate-token             → Api\TokenController@validate
GET    /api/v1/policies/search                 → Api\PolicyApiController@search
POST   /api/v1/serkep                          → Api\SerkepApiController@store
```

---

## 4. Service Layer

| Service | Tanggung Jawab |
|---|---|
| `SerkepService` | CRUD SERKEP, upload file, workflow advance, penomoran |
| `WorkflowService` | 7-step workflow (Spatie Model States), SLA tracking |
| `DisposisiService` | Buat & deliver disposisi ke inbox user target |
| `AiReviewService` | Trigger AI analysis per SERKEP version, parse temuan |
| `PolicyService` | CRUD policy, versioning, hierarki parent-child |
| `PolicySearchService` | Full-text + semantic search (AI). MySQL: MATCH AGAINST. PG: pgvector + tsvector |
| `ComplianceRiskService` | CRUD risk, hitung inherent/residual score |
| `AmlSyncService` | Pull alert data dari AML/CFT app via API |
| `IntegrationService` | Sync data ke/dari BeComply, RCS, APASI, PERISAI, dll. |
| `NotificationService` | Create + deliver (in-app, email, WhatsApp) |
| `EsignService` | Integrasi dengan Peruri BSrE untuk e-signature |
| `SlaService` | Monitor SLA per review_task, kirim alert overdue |

---

## 5. Inertia Pages (`resources/js/Pages/`)

```
Pages/
├── Dashboard.jsx                  # KPIs, AI co-pilot activity, SERKEP queue, charts
├── Inbox/
│   ├── Index.jsx                  # Split-pane: list + detail disposisi
│   └── Show.jsx                   # Detail view embedded
├── Serkep/
│   ├── Index.jsx                  # SERKEP list + tabs (status filter)
│   ├── Create.jsx                 # Modal: NewSerkepModal fields
│   ├── Show.jsx                   # 3-panel: TOC | Document Canvas | AI Panel
│   └── Trash.jsx
├── Repository/
│   ├── Index.jsx                  # Tabel + hierarki view + filter
│   ├── Show.jsx                   # Policy detail + versions + tertaut
│   └── Trash.jsx
├── Monitoring/
│   └── Index.jsx                  # KPIs, risk matrix, STR chart, commitments
├── Risk/
│   ├── Index.jsx                  # Risk list + heatmap per divisi
│   └── Trash.jsx
├── Aml/
│   └── Index.jsx                  # Alert table, STR tools, watchlist, tipology chart
├── Integrations/
│   └── Index.jsx                  # 8 integration cards + pipelines + audit trail
└── Settings/
    └── Index.jsx                  # 7-section sidebar settings
```

---

## 6. Key Design: SERKEP Document Viewer (3-panel layout)

`Pages/Serkep/Show.jsx` adalah halaman paling kompleks:

```
┌─────────────────┬──────────────────────────┬──────────────────┐
│ TOC (§1–§15)   │  Document Canvas          │  AI Co-pilot     │
│                 │  (IBM Plex Serif)         │  Tabs:           │
│ §1 ○           │                           │  - Findings (5)  │
│ §2 ●high       │  [Highlighted text]       │  - Saran (8)     │
│ §3 ○           │  .hl.high / .hl.med       │  - Rujukan (12)  │
│ §7 ●med        │                           │  - Tanya AI      │
│ ...            │                           │                  │
│ Lamp A         │                           │  [Chat bubbles]  │
└─────────────────┴──────────────────────────┴──────────────────┘
```

Fitur:
- Klik section di TOC → scroll ke section di canvas
- Klik highlight di canvas → aktifkan finding di AI panel
- "Terima saran" → update `ai_findings.status = accepted`
- "Diskusikan" → buka chat thread untuk finding tersebut
- "Abaikan" → update `ai_findings.status = ignored`

---

## 7. Key Design: AI Search (Cmd+K Modal)

`Components/AiSearchModal.jsx`:
- Full-screen overlay, 760px wide
- Input: IBM Plex Serif, besar
- Quick access: 4 top policy cards
- Hasil streaming: AI answer → policy cards (code, type, category, status, ver, date, title, summary, excerpt, pasal ref)
- Backend: `PolicySearchService` → MySQL FULLTEXT atau pgvector cosine similarity

---

## 8. Soft Delete & Trash Pattern

Sama seperti AML/CFT app — semua resource ada `Trash.jsx` dengan restore + hard delete.  
Audit log (`audit_logs`) tidak bisa dihapus — immutable.

---

## 9. SERKEP Workflow States

```
draft → review → kajian → approve → released
          ↓ (reject di setiap step)
         draft (dikembalikan ke pemrakarsa)
```

Implementasi via Spatie Model States:
```php
class SerkepStatus extends State {
    public static function config(): StateConfig {
        return parent::config()
            ->default(Draft::class)
            ->allowTransition(Draft::class, Review::class)
            ->allowTransition(Review::class, Kajian::class)
            ->allowTransition(Review::class, Draft::class)  // reject
            ->allowTransition(Kajian::class, Approve::class)
            ->allowTransition(Kajian::class, Draft::class)
            ->allowTransition(Approve::class, Released::class)
            ->allowTransition(Approve::class, Draft::class);
    }
}
```
