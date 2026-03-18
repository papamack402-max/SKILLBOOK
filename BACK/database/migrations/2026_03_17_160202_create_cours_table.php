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
        Schema::create('cours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); //
            $table->foreignId('categorie_id')->nullable()->constrained()->onDelete('set null');//
            $table->string('titre');
            $table->text('description');
            $table->decimal('prix', 8, 2);
            $table->integer('duree'); //en minutes
            $table->integer('nb_places'); //nombre de places disponibles
            $table->enum('status', ['brouillon', 'publie', 'archivé'])->default('brouillon'); //le statut du cours, il peut être "brouillon" ou "publieou "archivé"
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cours');
    }
};
