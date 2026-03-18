<?php

namespace App\Http\Controllers;

use App\Models\Session;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    public function index($coursId)
    {
        $sessions = Session::where('cours_id', $coursId)->get();
        return response()->json($sessions);
    }

    public function store(Request $request)
    {
        $request->validate([
            'cours_id'   => 'required|exists:cours,id',
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after:date_debut',
            'lieu'       => 'nullable|string',
        ]);

        $session = Session::create($request->all());
        return response()->json($session, 201);
    }

    public function destroy($id)
    {
        Session::findOrFail($id)->delete();
        return response()->json(['message' => 'Session supprimée']);
    }
}
