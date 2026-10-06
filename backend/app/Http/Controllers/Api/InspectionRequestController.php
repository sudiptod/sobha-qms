<?php

namespace App\Http\Controllers\Api;

use App\Models\Foreman;
use App\Models\InspectionRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InspectionRequestController
{
    /**
     * List Inspection Requests (+19 badge in sidebar).
     */
    public function index(Request $request): JsonResponse
    {
        $query = InspectionRequest::with(['project', 'activity', 'subActivity', 'foreman'])
            ->orderByDesc('id');

        if ($request->filled('sub_activity_id')) {
            $query->where('sub_activity_id', $request->input('sub_activity_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json($query->get());
    }

    /**
     * Update Inspection Request status (Approve / Reject / In Review).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $ir = InspectionRequest::findOrFail($id);
        $ir->update($request->only(['status', 'defects_logged']));

        return response()->json($ir);
    }

    /**
     * List all Foremen.
     */
    public function foremen(): JsonResponse
    {
        return response()->json(Foreman::orderBy('id')->get());
    }
}
