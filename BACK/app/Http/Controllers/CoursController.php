<?php

namespace App\Http\Controllers; //permet de gérer les cours : création, affichage, mise à jour, suppression, validation, rejet et affichage des cours d'un formateur spécifique.

use App\Models\Cours; //permet de gérer les cours : création, affichage, mise à jour, suppression, validation, rejet et affichage des cours d'un formateur spécifique. 
use App\Models\Categorie; //permet de gérer les cours : création, affichage, mise
use Illuminate\Http\Request; //permet de gérer les cours : création, affichage, mise à jour, suppression, validation, rejet et affichage des cours d'un formateur spécifique.

class CoursController extends Controller
{
    //permet de gérer les cours : création, affichage, mise à jour, suppression, validation, rejet et affichage des cours d'un formateur spécifique. 
    //Les méthodes utilisent des relations Eloquent pour récupérer les données associées (formateur, catégorie, sessions, réservations, apprenants) et les retourner au format JSON.
    public function index()
    {
        return response()->json(
            Cours::with('formateur', 'categorie', 'sessions')
                ->where('status', 'publié')
                ->get()
        );
    }
    // permet à l'administrateur de voir tous les cours avec les détails du formateur, de la catégorie, des sessions et des apprenants inscrits, même pour les cours en brouillon ou rejetés.
    public function indexAdmin()
    {
        $cours = Cours::with([
            'formateur',
            'categorie',
            'sessions.reservations.apprenant'
        ])
            ->get()
            ->map(function ($c) {

                $apprenants = $c->sessions->flatMap(function ($s) {
                    return $s->reservations
                        ->where('status', '!=', 'annulée')
                        ->map(function ($r) {
                            return [
                                'nom'   => $r->apprenant->nom ?? 'Inconnu',
                                'email' => $r->apprenant->email ?? '',
                            ];
                        });
                })->values();

                return [
                    'id'            => $c->id,
                    'titre'         => $c->titre,
                    'description'   => $c->description,
                    'prix'          => $c->prix,
                    'duree'         => $c->duree,
                    'nb_places'     => $c->nb_places,
                    'status'        => $c->status,
                    'formateur_nom' => $c->formateur->nom ?? 'Inconnu',
                    'nb_inscrits'   => $apprenants->count(),
                    'apprenants'    => $apprenants,           // 
                    'created_at'    => $c->created_at,
                ];
            });

        return response()->json($cours);
    }

    public function store(Request $request)
    {
        $request->validate([
            'titre'        => 'required|string',
            'description'  => 'required|string',
            'prix'         => 'required|numeric',
            'duree'        => 'required|integer',
            'nb_places'    => 'required|integer',
            'categorie_id' => 'nullable|exists:categories,id',
        ]);

        $cours = Cours::create([
            ...$request->all(),
            'user_id' => $request->user()->id,
            'status'  => 'brouillon',
        ]);

        return response()->json($cours, 201);
    }

    public function show($id)
    {
        $cours = Cours::with('formateur', 'categorie', 'sessions')->findOrFail($id);
        return response()->json($cours);
    }

    public function update(Request $request, $id)
    {
        $cours = Cours::findOrFail($id);
        $cours->update($request->all());
        return response()->json($cours);
    }

    public function destroy($id)
    {
        Cours::findOrFail($id)->delete();
        return response()->json(['message' => 'Cours supprimé']);
    }
    // 👇 Valide un cours (admin)
    public function valider($id)
    {
        $cours = Cours::findOrFail($id);
        $cours->update(['status' => 'publie']);
        return response()->json(['message' => 'Cours validé']);
    }
    // 👇 Rejette un cours (admin)
    public function rejeter($id)
    {
        $cours = Cours::findOrFail($id);
        $cours->update(['status' => 'rejete']);
        return response()->json(['message' => 'Cours rejeté']);
    }
    // 👇 Affiche les cours d'un formateur spécifique
    public function mesCours(Request $request)
    {
        $cours = Cours::with([
            'sessions.reservations.apprenant'
        ])
            ->where('user_id', $request->user()->id)
            ->get()
            ->map(function ($c) {
                $apprenants = $c->sessions->flatMap(function ($s) {
                    return $s->reservations
                        ->where('status', '!=', 'annulée')
                        ->map(function ($r) {
                            return [
                                'nom'   => $r->apprenant->nom ?? 'Inconnu',
                                'email' => $r->apprenant->email ?? '',
                            ];
                        });
                })->values();

                return [
                    'id'            => $c->id,
                    'titre'         => $c->titre,
                    'description'   => $c->description,
                    'prix'          => $c->prix,
                    'duree'         => $c->duree,
                    'nb_places'     => $c->nb_places,
                    'status'        => $c->status,
                    'nb_inscrits'   => $apprenants->count(),
                    'apprenants'    => $apprenants,
                    'created_at'    => $c->created_at,
                ];
            });

        return response()->json($cours);
    }
}
