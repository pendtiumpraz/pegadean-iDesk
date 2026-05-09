<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id'             => $request->user()->id,
                    'portal_user_id' => $request->user()->portal_user_id,
                    'name'           => $request->user()->name,
                    'email'          => $request->user()->email,
                    'nip'            => $request->user()->nip,
                    'jabatan'        => $request->user()->jabatan,
                    'divisi'         => $request->user()->divisi,
                    'avatar_initials'=> $request->user()->avatar_initials,
                    'photo_path'     => $request->user()->photo_path,
                    'status'         => $request->user()->status,
                    'mfa_enabled'    => $request->user()->mfa_enabled,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
