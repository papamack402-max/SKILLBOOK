<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    protected $table = 'course_sessions'; // Spécifie le nom de la table dans la base de données

    protected $fillable = [
        'cours_id',
        'date_debut',
        'date_fin',
    ];
    public function cours()
    {
        return $this->belongsTo(Cours::class); //une session appartient à un cours (cours_id)
    }
    public function reservations()
    {
        return $this->hasMany(Reservation::class); //une session peut avoir plusieurs réservations
    }
}
