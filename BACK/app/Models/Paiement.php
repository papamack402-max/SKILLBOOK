<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    protected $fillable = [  //permet de spécifier les champs qui peuvent être remplis en masse (mass assignment)
        'reservation_id',
        'montant',
        'date_paiement',
        'methode',
        'status',
    ];
    public function reservation()
    {
        return $this->belongsTo(Reservation::class); //un paiement appartient à une réservation (reservation_id)
    }
}
