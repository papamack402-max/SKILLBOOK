<?php

namespace App\Http\Controllers;

use App\Models\Cours;
use Illuminate\Http\Request;

class CoursController extends Controller
{
    public function index()
    {
        return response()->json(
            Cours::with('formateur', 'categorie', 'sessions')->get()
        );
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
        $cours->update(['statut' => 'publié']);
        return response()->json(['message' => 'Cours validé']);
    }
}
