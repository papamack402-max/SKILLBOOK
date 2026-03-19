<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [  // 
        'user_id',
        'session_id',
        'date_reservation',
        'nb_places_reservees',
        'status',
    ]; //permet de spécifier les champs qui peuvent être remplis en masse (mass assignment)
    public function apprenant()
    {
        return $this->belongsTo(User::class, 'user_id'); //une réservation appartient à un apprenant (user_id)
    }
    public function session()
    {
        return $this->belongsTo(Session::class); //une réservation appartient à une session (session_id)
    }
    public function paiement()
    {
        return $this->hasOne(Paiement::class); //une réservation peut avoir un paiement associé
    }
}
