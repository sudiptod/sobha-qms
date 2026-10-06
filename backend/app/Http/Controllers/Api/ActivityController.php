<?php

namespace App\Http\Controllers\Api;

use App\Models\Activity;
use App\Models\SubActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityController
{
    /**
     * List Parent Activities with nested Sub-Activities for the Screen 2 Accordion Table.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Activity::with('subActivities')->orderBy('id');

        if ($request->filled('parent_activity_id')) {
            $query->where('id', $request->input('parent_activity_id'));
        }

        if ($request->filled('date')) {
            $query->where('scheduled_date', 'like', '%' . $request->input('date') . '%');
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%')
                    ->orWhereHas('subActivities', function ($sq) use ($search) {
                        $sq->where('name', 'like', '%' . $search . '%')
                            ->orWhere('description', 'like', '%' . $search . '%');
                    });
            });
        }

        return response()->json($query->get());
    }

    /**
     * Create a new Parent Activity.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sub_division_id' => 'nullable|integer',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'total_sub_activities_override' => 'nullable|integer',
            'scheduled_date' => 'nullable|string',
            'scheduled_time' => 'nullable|string',
        ]);

        $activity = Activity::create([
            'sub_division_id' => $validated['sub_division_id'] ?? 1,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? 'Lorem Ipsum Lorem Ipsum',
            'total_sub_activities_override' => $validated['total_sub_activities_override'] ?? 14,
            'scheduled_date' => $validated['scheduled_date'] ?? '1 Dec 2023',
            'scheduled_time' => $validated['scheduled_time'] ?? '11:00PM',
        ]);

        return response()->json($activity->load('subActivities'), 201);
    }

    /**
     * Create a new Sub-Activity under a Parent Activity.
     */
    public function storeSubActivity(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'activity_id' => 'required|integer|exists:activities,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'insp_req_count' => 'nullable|integer|min:0',
            'scheduled_date' => 'nullable|string',
            'scheduled_time' => 'nullable|string',
        ]);

        $subActivity = SubActivity::create([
            'activity_id' => $validated['activity_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? 'Lorem Ipsum Lorem Ipsum',
            'insp_req_count' => $validated['insp_req_count'] ?? 45,
            'scheduled_date' => $validated['scheduled_date'] ?? '18 Nov 2023',
            'scheduled_time' => $validated['scheduled_time'] ?? '11:00PM',
        ]);

        return response()->json($subActivity, 201);
    }

    /**
     * Update a Sub-Activity from Screen 2's nested table Edit action.
     */
    public function updateSubActivity(Request $request, int $id): JsonResponse
    {
        $subActivity = SubActivity::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'insp_req_count' => 'sometimes|integer|min:0',
            'scheduled_date' => 'sometimes|string',
            'scheduled_time' => 'sometimes|string',
        ]);

        $subActivity->update($validated);

        return response()->json($subActivity);
    }

    /**
     * Delete a Sub-Activity.
     */
    public function destroySubActivity(int $id): JsonResponse
    {
        $subActivity = SubActivity::findOrFail($id);
        $subActivity->delete();

        return response()->json(['deleted' => true, 'id' => $id]);
    }
}
