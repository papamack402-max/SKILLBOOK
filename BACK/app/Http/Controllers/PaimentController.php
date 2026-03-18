<?php

namespace App\Http\Controllers;

use App\Models\Paiement;
use App\Models\Reservation;
use Illuminate\Http\Request;

class PaiementController extends Controller
{
    public function effectuer(Request $request)
    {
        $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'montant'        => 'required|numeric',
            'methode'        => 'required|in:carte,mobile_money,virement',
        ]);

        $paiement = Paiement::create([
            ...$request->all(),
            'date_paiement' => now(),
            'statut'        => 'payé',
        ]);

        Reservation::findOrFail($request->reservation_id)
            ->update(['statut' => 'confirmée']);

        return response()->json($paiement, 201);
    }

    public function rembourser($id)
    {
        $paiement = Paiement::findOrFail($id);
        $paiement->update(['statut' => 'remboursé']);
        return response()->json(['message' => 'Paiement remboursé']);
    }
}
