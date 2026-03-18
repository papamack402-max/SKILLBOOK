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
        //cette table sert à stocker les utilisateurs de l'application, elle est nécessaire pour que le trait "Authenticatable" puisse fonctionner correctement
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable(); //cette colonne est nécessaire pour que le trait "MustVerifyEmail" puisse fonctionner correctement
            $table->string('password');
            $table->enum('role', ['admin', 'formateur', 'apprenant'])->default('apprenant'); //
            $table->rememberToken(); //cette colonne est nécessaire pour que le trait "Authenticatable" puisse fonctionner correctement
            $table->timestamps(); //
        });
        //cette table est nécessaire pour que le driver de mot de passe "database" puisse fonctionner correctement
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
        //cette table est nécessaire pour que le driver de session "database" puisse fonctionner correctement
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};



