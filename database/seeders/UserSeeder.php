<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = Hash::make('Password123!');

        $users = [
            [
                'portal_user_id' => null,
                'email'          => 'policy.owner@idesk.pegadaian.co.id',
                'name'           => 'Policy Owner',
                'jabatan'        => 'Policy Owner',
                'status'         => 'aktif',
                'password'       => $defaultPassword,
            ],
            [
                'portal_user_id' => null,
                'email'          => 'reviewer@idesk.pegadaian.co.id',
                'name'           => 'Policy Reviewer',
                'jabatan'        => 'Reviewer',
                'status'         => 'aktif',
                'password'       => $defaultPassword,
            ],
            [
                'portal_user_id' => null,
                'email'          => 'compliance.desk@idesk.pegadaian.co.id',
                'name'           => 'Compliance Desk',
                'jabatan'        => 'Compliance Analyst',
                'status'         => 'aktif',
                'password'       => $defaultPassword,
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                $user
            );
        }
    }
}
