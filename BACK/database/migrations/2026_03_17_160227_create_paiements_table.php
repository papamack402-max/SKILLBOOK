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
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained()->onDelete('cascade'); //la réservation associée au paiement
            $table->decimal('montant', 8, 2); //le montant du paiement
            $table->dateTime('date_paiement'); //la date du paiement
            $table->string('methode'); //la méthode de paiement utilisée, elle peut être "wave" ou "OM"
            $table->enum('status', ['en_attente', 'confirme', 'echoue'])->default('en_attente'); //le statut du paiement, il peut être "en_attente", "confirme" ou "echoue"
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
