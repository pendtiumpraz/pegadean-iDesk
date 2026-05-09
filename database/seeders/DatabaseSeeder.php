<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            SystemSettingSeeder::class,
            UserSeeder::class,
            IntegrationSeeder::class,
            AuditTrailSeeder::class,
        ]);
    }
}
