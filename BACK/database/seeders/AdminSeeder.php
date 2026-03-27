<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        if (!User::where('email', 'gmc@site.com')->exists()) {
            User::create([
                'nom'      => 'GMC',
                'email'    => 'gmc@site.com',
                'password' => Hash::make('123456'),
                'role'     => 'admin',
            ]);

            $this->command->info('✅ Admin GMC créé avec succès !');
        } else {
            $this->command->info('ℹ️ Admin GMC existe déjà.');
        }
    }
}
