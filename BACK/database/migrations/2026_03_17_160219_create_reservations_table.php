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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); //apprenant qui réserve le cours
            $table->foreignId('session_id')->constrained('course_sessions')->onDelete('cascade'); //session du cours réservé
            $table->dateTime('date_reservation'); //date de la réservation
            $table->integer('nb_places_reservees'); //nombre de places réservées
            $table->enum('status', ['en_attente', 'confirmee', 'annulee'])->default('en_attente'); //le statut de la réservation, il peut être "en_attente", "confirmee" ou "annulee"
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
