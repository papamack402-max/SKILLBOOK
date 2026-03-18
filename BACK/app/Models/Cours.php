<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cours extends Model
{
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
}
