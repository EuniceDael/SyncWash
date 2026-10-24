<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'syncwash',
            'phone' => '09924790549',
            'password' => 'eunicedaeladmin12345',
            'role' => 'admin',
        ]);

        $services = [
            ['name' => 'Wash & Fold', 'price_per_kg' => 40],
            ['name' => 'Wash, Dry & Fold', 'price_per_kg' => 60],
            ['name' => 'Dry Clean', 'price_per_kg' => 120],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}