<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Cours;
use Psy\Readline\Interactive\Actions\FallbackAction;

class CoursSeeder extends Seeder
{
    public function run(): void
    {
        if (!User::where('email', 'gmc@site.com')->exists()) {
            Cours::create([
                    'user_id' => 1, // Assurez-vous que l'ID de l'utilisateur existe
                    'categorie_id' => 1, // Assurez-vous que l'ID de la catégorie existe
                    'titre' => fake()->title(),
                    'description' => fake()->paragraph(),
                    'prix' => 100,
                    'duree' => 60,
                    'nb_places' => 20,
                    'status' => 'actif',
                        ]);

            $this->command->info('✅ Cours créé avec succès !');
        } else {
            $this->command->info('ℹ️ Admin GMC existe déjà.');
        }
    }
}
