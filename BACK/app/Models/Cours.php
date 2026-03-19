<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cours extends Model
{
    protected $fillable = [  // permet de spécifier les champs qui peuvent être remplis en masse (mass assignment)
        'user_id',
        'categorie_id',
        'titre',
        'description',
        'prix',
        'duree',
        'nb_places',
        'status',
    ];
    public function formateur()
    {
        return $this->belongsTo(User::class, 'user_id'); //un cours appartient à un formateur (user_id)
    }
    public function categorie()
    {
        return $this->belongsTo(Categorie::class); //un cours appartient à une catégorie (categorie_id)
    }
    public function sessions()
    {
        return $this->hasMany(Session::class); //un cours peut avoir plusieurs sessions
    }
    public function reservations()
    {
        return $this->hasManyThrough(
            \App\Models\Reservation::class,
            \App\Models\Session::class,
            'cours_id',    // clé étrangère sur sessions
            'session_id',  // clé étrangère sur reservations
            'id',          // clé locale sur cours
            'id'           // clé locale sur sessions
        );
    }
}
