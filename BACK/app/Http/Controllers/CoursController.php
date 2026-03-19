<?php

namespace App\Http\Controllers;

use App\Models\Cours;
use Illuminate\Http\Request;

class CoursController extends Controller
{
    public function index()
    {
        return response()->json(
            Cours::with('formateur', 'categorie', 'sessions')
                ->where('status', 'publié')
                ->get()
        );
    }
    public function indexAdmin()
    {
        $cours = Cours::with([
            'formateur',
            'categorie',
            'sessions.reservations.apprenant'
        ])
            ->get()
            ->map(function ($c) {
                // 👇 définit $apprenants avant de l'utiliser
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
                    'nb_inscrits'   => $apprenants->count(), // 👈 utilise $apprenants
                    'apprenants'    => $apprenants,           // 👈 utilise $apprenants
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

    public function valider($id)
    {
        $cours = Cours::findOrFail($id);
        $cours->update(['status' => 'publié']);
        return response()->json(['message' => 'Cours validé']);
    }
    public function rejeter($id)
    {
        $cours = Cours::findOrFail($id);
        $cours->update(['status' => 'rejeté']);
        return response()->json(['message' => 'Cours rejeté']);
    }
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
