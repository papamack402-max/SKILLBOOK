<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    public function apprenant(){
        return $this->belongsTo(User::class, 'user_id'); //une réservation appartient à un apprenant (user_id)
    }
    public function session(){
        return $this->belongsTo(Session::class); //une réservation appartient à une session (session_id)
    }
    public function paiement(){
        return $this->hasOne(Paiement::class); //une réservation peut avoir un paiement associé
    }
}
