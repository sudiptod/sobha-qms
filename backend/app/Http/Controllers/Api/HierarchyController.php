<?php

namespace App\Http\Controllers\Api;

use App\Models\Activity;
use App\Models\DefectThresholdMapping;
use App\Models\Division;
use App\Models\Foreman;
use App\Models\InspectionRequest;
use App\Models\Project;
use App\Models\SubActivity;
use App\Models\SubDivision;
use Illuminate\Http\JsonResponse;

class HierarchyController
{
    /**
     * Return all hierarchy entities for cascading dropdowns and dashboard stats.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'projects' => Project::orderBy('id')->get(),
            'divisions' => Division::orderBy('id')->get(),
            'sub_divisions' => SubDivision::orderBy('id')->get(),
            'activities' => Activity::with('subActivities')->orderBy('id')->get(),
            'sub_activities' => SubActivity::orderBy('id')->get(),
            'stats' => [
                'total_projects' => Project::count(),
                'total_activities' => Activity::count(),
                'total_sub_activities' => SubActivity::count(),
                'total_defect_rules' => DefectThresholdMapping::count(),
                'pending_inspection_requests' => InspectionRequest::where('status', 'Pending')->count(),
                'total_foremen' => Foreman::count(),
            ],
        ]);
    }
}
