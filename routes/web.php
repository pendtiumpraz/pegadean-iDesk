<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PolicyController;
use App\Http\Controllers\SerkepController;
use App\Http\Controllers\ReviewTaskController;
use App\Http\Controllers\DisposisiController;
use App\Http\Controllers\AiReviewController;
use App\Http\Controllers\ComplianceRiskController;
use App\Http\Controllers\AmlAlertController;
use App\Http\Controllers\StrReportController;
use App\Http\Controllers\CommitmentController;
use App\Http\Controllers\SystemSettingController;
use App\Http\Controllers\MonitoringController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\Auth\LoginController;

Route::get('/login',  [LoginController::class, 'showLogin'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.post');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout')->middleware('auth');

// Portal SSO callback flow
Route::get('/auth/portal/redirect', [LoginController::class, 'portalRedirect'])->name('auth.portal.redirect');
Route::get('/auth/portal/callback', [LoginController::class, 'portalCallback'])->name('auth.portal.callback');

Route::middleware('auth')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Policy Lifecycle
    Route::prefix('kebijakan')->name('policies.')->group(function () {
        Route::get('/',                  [PolicyController::class, 'index'])->name('index');
        Route::get('/create',            [PolicyController::class, 'create'])->name('create');
        Route::post('/',                 [PolicyController::class, 'store'])->name('store');
        Route::get('/{policy}',          [PolicyController::class, 'show'])->name('show');
        Route::get('/{policy}/edit',     [PolicyController::class, 'edit'])->name('edit');
        Route::put('/{policy}',          [PolicyController::class, 'update'])->name('update');
        Route::delete('/{policy}',       [PolicyController::class, 'destroy'])->name('destroy');
        Route::get('/trash',             [PolicyController::class, 'trash'])->name('trash');
        Route::post('/{id}/restore',     [PolicyController::class, 'restore'])->name('restore');
        Route::delete('/{id}/force',     [PolicyController::class, 'forceDelete'])->name('force-delete');
        Route::post('/{policy}/ai-review', [AiReviewController::class, 'runForPolicy'])->name('ai-review');
    });

    // Serkep (Surat Edaran/Keputusan)
    Route::prefix('serkep')->name('serkep.')->group(function () {
        Route::get('/',                  [SerkepController::class, 'index'])->name('index');
        Route::get('/create',            [SerkepController::class, 'create'])->name('create');
        Route::post('/',                 [SerkepController::class, 'store'])->name('store');
        Route::get('/{serkep}',          [SerkepController::class, 'show'])->name('show');
        Route::get('/{serkep}/edit',     [SerkepController::class, 'edit'])->name('edit');
        Route::put('/{serkep}',          [SerkepController::class, 'update'])->name('update');
        Route::delete('/{serkep}',       [SerkepController::class, 'destroy'])->name('destroy');
        Route::get('/trash',             [SerkepController::class, 'trash'])->name('trash');
        Route::post('/{id}/restore',     [SerkepController::class, 'restore'])->name('restore');
        Route::delete('/{id}/force',     [SerkepController::class, 'forceDelete'])->name('force-delete');
    });

    // Review Tasks
    Route::prefix('tugas-review')->name('reviews.')->group(function () {
        Route::get('/',                  [ReviewTaskController::class, 'index'])->name('index');
        Route::get('/create',            [ReviewTaskController::class, 'create'])->name('create');
        Route::post('/',                 [ReviewTaskController::class, 'store'])->name('store');
        Route::get('/{task}',            [ReviewTaskController::class, 'show'])->name('show');
        Route::put('/{task}',            [ReviewTaskController::class, 'update'])->name('update');
        Route::put('/{task}/complete',   [ReviewTaskController::class, 'complete'])->name('complete');
        Route::delete('/{task}',         [ReviewTaskController::class, 'destroy'])->name('destroy');
    });

    // Disposisi
    Route::prefix('disposisi')->name('disposisi.')->group(function () {
        Route::get('/',                  [DisposisiController::class, 'index'])->name('index');
        Route::post('/',                 [DisposisiController::class, 'store'])->name('store');
        Route::get('/{disposisi}',       [DisposisiController::class, 'show'])->name('show');
        Route::put('/{disposisi}/read',  [DisposisiController::class, 'markRead'])->name('read');
    });

    // AI Reviews
    Route::prefix('ai-review')->name('ai-reviews.')->group(function () {
        Route::get('/',           [AiReviewController::class, 'index'])->name('index');
        Route::get('/{review}',   [AiReviewController::class, 'show'])->name('show');
    });

    // Compliance Risks
    Route::prefix('risiko-kepatuhan')->name('risks.')->group(function () {
        Route::get('/',                [ComplianceRiskController::class, 'index'])->name('index');
        Route::get('/create',          [ComplianceRiskController::class, 'create'])->name('create');
        Route::post('/',               [ComplianceRiskController::class, 'store'])->name('store');
        Route::get('/{risk}',          [ComplianceRiskController::class, 'show'])->name('show');
        Route::get('/{risk}/edit',     [ComplianceRiskController::class, 'edit'])->name('edit');
        Route::put('/{risk}',          [ComplianceRiskController::class, 'update'])->name('update');
        Route::delete('/{risk}',       [ComplianceRiskController::class, 'destroy'])->name('destroy');
        Route::get('/trash',           [ComplianceRiskController::class, 'trash'])->name('trash');
        Route::post('/{id}/restore',   [ComplianceRiskController::class, 'restore'])->name('restore');
        Route::delete('/{id}/force',   [ComplianceRiskController::class, 'forceDelete'])->name('force-delete');
    });

    // AML Alerts (read-only view from AML app)
    Route::prefix('aml-alerts')->name('aml-alerts.')->group(function () {
        Route::get('/',           [AmlAlertController::class, 'index'])->name('index');
        Route::get('/{alert}',    [AmlAlertController::class, 'show'])->name('show');
    });

    // STR Reports
    Route::prefix('str')->name('str.')->group(function () {
        Route::get('/',                [StrReportController::class, 'index'])->name('index');
        Route::get('/create',          [StrReportController::class, 'create'])->name('create');
        Route::post('/',               [StrReportController::class, 'store'])->name('store');
        Route::get('/{str}',           [StrReportController::class, 'show'])->name('show');
        Route::put('/{str}',           [StrReportController::class, 'update'])->name('update');
        Route::post('/{str}/submit',   [StrReportController::class, 'submit'])->name('submit');
    });

    // Commitments
    Route::prefix('komitmen')->name('commitments.')->group(function () {
        Route::get('/',               [CommitmentController::class, 'index'])->name('index');
        Route::get('/create',         [CommitmentController::class, 'create'])->name('create');
        Route::post('/',              [CommitmentController::class, 'store'])->name('store');
        Route::get('/{comm}',         [CommitmentController::class, 'show'])->name('show');
        Route::put('/{comm}',         [CommitmentController::class, 'update'])->name('update');
        Route::delete('/{comm}',      [CommitmentController::class, 'destroy'])->name('destroy');
    });

    // Monitoring & Analytics
    Route::prefix('monitoring')->name('monitoring.')->group(function () {
        Route::get('/',             [MonitoringController::class, 'index'])->name('index');
        Route::get('/kpmr/export',  [MonitoringController::class, 'exportKpmr'])->name('export-kpmr');
    });

    // Integrasi Sistem
    Route::prefix('integrasi')->name('integrations.')->group(function () {
        Route::get('/',                [IntegrationController::class, 'index'])->name('index');
        Route::get('/{integration}',   [IntegrationController::class, 'show'])->name('show');
        Route::post('/{integration}/sync', [IntegrationController::class, 'sync'])->name('sync');
    });

    // Settings
    Route::prefix('pengaturan')->name('settings.')->group(function () {
        Route::get('/',      [SystemSettingController::class, 'index'])->name('index');
        Route::put('/{key}', [SystemSettingController::class, 'update'])->name('update');
    });
});
