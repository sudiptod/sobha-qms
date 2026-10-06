<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\DefectThresholdController;
use App\Http\Controllers\Api\HierarchyController;
use App\Http\Controllers\Api\InspectionRequestController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SOBHA QMS API Routes (/api/*)
|--------------------------------------------------------------------------
*/

Route::get('/hierarchy', [HierarchyController::class, 'index']);

// Module A: Defect Threshold Mapping (Screen 1)
Route::get('/defect-thresholds', [DefectThresholdController::class, 'index']);
Route::post('/defect-thresholds', [DefectThresholdController::class, 'store']);
Route::put('/defect-thresholds/{id}', [DefectThresholdController::class, 'update']);
Route::delete('/defect-thresholds/{id}', [DefectThresholdController::class, 'destroy']);

// Module B: All Activities & Sub-Activities (Screen 2)
Route::get('/activities', [ActivityController::class, 'index']);
Route::post('/activities', [ActivityController::class, 'store']);
Route::post('/sub-activities', [ActivityController::class, 'storeSubActivity']);
Route::put('/sub-activities/{id}', [ActivityController::class, 'updateSubActivity']);
Route::delete('/sub-activities/{id}', [ActivityController::class, 'destroySubActivity']);

// Module C: Inspection Requests (+19 badge) & Foremen
Route::get('/inspection-requests', [InspectionRequestController::class, 'index']);
Route::put('/inspection-requests/{id}', [InspectionRequestController::class, 'update']);
Route::get('/foremen', [InspectionRequestController::class, 'foremen']);
