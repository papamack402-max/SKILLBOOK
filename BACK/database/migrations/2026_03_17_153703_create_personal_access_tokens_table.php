<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->text('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
    }
};

//cette table est nécessaire pour que le trait "HasApiTokens" puisse fonctionner correctement, elle est utilisée pour stocker les tokens d'accès personnels générés par les utilisateurs de l'application, ces tokens sont utilisés pour authentifier les requêtes API effectuées par les utilisateurs de l'application, ils permettent aux utilisateurs de s'authentifier sans avoir à fournir leurs identifiants à chaque requête, ils sont généralement utilisés pour les applications mobiles ou les clients tiers qui ont besoin d'accéder à l'API de l'application.