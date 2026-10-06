<?php

namespace App\Http\Controllers\Api;

use App\Models\DefectThresholdMapping;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DefectThresholdController
{
    /**
     * List Defect Threshold Mappings with optional 7-parameter cascading filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        $mappings = DefectThresholdMapping::with([
            'project:id,name',
            'division:id,name',
            'subDivision:id,name',
            'activity:id,name',
            'subActivity:id,name',
        ])
            ->filter($request->only([
                'search',
                'project_id',
                'division_id',
                'sub_division_id',
                'activity_id',
                'sub_activity_id',
                'severity_index',
                'control_index',
            ]))
            ->orderBy('id')
            ->get();

        return response()->json($mappings);
    }

    /**
     * Create a new Defect Threshold Mapping rule.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'nullable|integer',
            'division_id' => 'nullable|integer',
            'sub_division_id' => 'nullable|integer',
            'activity_id' => 'nullable|integer',
            'sub_activity_id' => 'nullable|integer',
            'defect_type' => 'required|string|max:255',
            'defect_threshold' => 'required|integer|min:1',
            'sporadic_threshold' => 'required|integer|min:1',
            'chronic_threshold' => 'required|integer|min:1',
            'severity_index' => 'required|integer|min:1|max:10',
            'control_index' => 'required|integer|min:1|max:10',
        ]);

        $mapping = DefectThresholdMapping::create($validated);

        return response()->json($mapping, 201);
    }

    /**
     * Update an existing Defect Threshold Mapping rule (inline pill edit or modal edit).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $mapping = DefectThresholdMapping::findOrFail($id);

        $validated = $request->validate([
            'project_id' => 'nullable|integer',
            'division_id' => 'nullable|integer',
            'sub_division_id' => 'nullable|integer',
            'activity_id' => 'nullable|integer',
            'sub_activity_id' => 'nullable|integer',
            'defect_type' => 'sometimes|string|max:255',
            'defect_threshold' => 'sometimes|integer|min:1',
            'sporadic_threshold' => 'sometimes|integer|min:1',
            'chronic_threshold' => 'sometimes|integer|min:1',
            'severity_index' => 'sometimes|integer|min:1|max:10',
            'control_index' => 'sometimes|integer|min:1|max:10',
        ]);

        $mapping->update($validated);

        return response()->json($mapping);
    }

    /**
     * Delete a Defect Threshold Mapping row.
     */
    public function destroy(int $id): JsonResponse
    {
        $mapping = DefectThresholdMapping::findOrFail($id);
        $mapping->delete();

        return response()->json(['deleted' => true, 'id' => $id]);
    }
}
