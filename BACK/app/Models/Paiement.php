<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    public function reservation(){
        return $this->belongsTo(Reservation::class); //un paiement appartient à une réservation (reservation_id)
    }
}
