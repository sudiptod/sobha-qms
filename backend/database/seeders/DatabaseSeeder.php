<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\DefectThresholdMapping;
use App\Models\Division;
use App\Models\Foreman;
use App\Models\InspectionRequest;
use App\Models\Project;
use App\Models\SubActivity;
use App\Models\SubDivision;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with exact data from the reference screenshots.
     */
    public function run(): void
    {
        // 1. Projects
        $p1 = Project::create([
            'name' => 'Sobha Hartland II',
            'code' => 'SHL-02',
            'location' => 'MBR City, Dubai',
            'status' => 'Active',
        ]);
        $p2 = Project::create([
            'name' => 'Sobha One Tower A',
            'code' => 'SON-01',
            'location' => 'Ras Al Khor, Dubai',
            'status' => 'Active',
        ]);
        $p3 = Project::create([
            'name' => 'Sobha SeaHaven',
            'code' => 'SSH-03',
            'location' => 'Dubai Harbour',
            'status' => 'Active',
        ]);

        // 2. Divisions
        $d1 = Division::create(['project_id' => $p1->id, 'name' => 'MEP Division']);
        $d2 = Division::create(['project_id' => $p1->id, 'name' => 'Civil & Structural']);
        $d3 = Division::create(['project_id' => $p2->id, 'name' => 'Facade & Glazing']);
        $d4 = Division::create(['project_id' => $p3->id, 'name' => 'Interior Fit-Out']);

        // 3. Sub-Divisions
        $sd1 = SubDivision::create(['division_id' => $d1->id, 'name' => 'HVAC & Chilled Water']);
        $sd2 = SubDivision::create(['division_id' => $d1->id, 'name' => 'Electrical & LV']);
        $sd3 = SubDivision::create(['division_id' => $d2->id, 'name' => 'Earthworks & Substructure']);
        $sd4 = SubDivision::create(['division_id' => $d3->id, 'name' => 'Curtain Wall & Glazing']);

        // 4. Parent Activities (Exact match to Screenshot 2: "All Activities")
        $act1 = Activity::create([
            'sub_division_id' => $sd3->id,
            'name' => 'Site Preparation',
            'description' => 'Lorem Ipsum Lorem Ipsum',
            'total_sub_activities_override' => 14,
            'scheduled_date' => '1 Dec 2023',
            'scheduled_time' => '11:00PM',
        ]);
        $act2 = Activity::create([
            'sub_division_id' => $sd3->id,
            'name' => 'Foundation Construction',
            'description' => 'Lorem Ipsum Lorem Ipsum',
            'total_sub_activities_override' => 14,
            'scheduled_date' => '1 Dec 2023',
            'scheduled_time' => '11:00PM',
        ]);
        $act3 = Activity::create([
            'sub_division_id' => $sd1->id,
            'name' => 'Framing',
            'description' => 'Lorem Ipsum Lorem Ipsum',
            'total_sub_activities_override' => 14,
            'scheduled_date' => '1 Dec 2023',
            'scheduled_time' => '11:00PM',
        ]);
        $act4 = Activity::create([
            'sub_division_id' => $sd4->id,
            'name' => 'Enclosure',
            'description' => 'Lorem Ipsum Lorem Ipsum',
            'total_sub_activities_override' => 14,
            'scheduled_date' => '1 Dec 2023',
            'scheduled_time' => '11:00PM',
        ]);

        // 5. Sub-Activities (Exact match to Screenshot 2 expanded accordion + realistic items for others)
        $sa1 = SubActivity::create([
            'activity_id' => $act1->id,
            'name' => 'Clearing and Grading',
            'description' => 'Lorem Ipsum Lorem Ipsum',
            'insp_req_count' => 45,
            'scheduled_date' => '18 Nov 2023',
            'scheduled_time' => '11:00PM',
        ]);
        $sa2 = SubActivity::create([
            'activity_id' => $act1->id,
            'name' => 'Clearing and Grading',
            'description' => 'Lorem Ipsum Lorem Ipsum',
            'insp_req_count' => 45,
            'scheduled_date' => '18 Nov 2023',
            'scheduled_time' => '11:00PM',
        ]);
        $sa3 = SubActivity::create([
            'activity_id' => $act2->id,
            'name' => 'Pile Cap & Raft Reinforcement',
            'description' => 'Substructure rebar inspection and waterproofing membrane check',
            'insp_req_count' => 32,
            'scheduled_date' => '22 Nov 2023',
            'scheduled_time' => '10:30AM',
        ]);
        $sa4 = SubActivity::create([
            'activity_id' => $act3->id,
            'name' => 'FCU & Ductwork First Fix',
            'description' => 'HVAC fan coil unit mounting, valve package, and access panel verification',
            'insp_req_count' => 28,
            'scheduled_date' => '25 Nov 2023',
            'scheduled_time' => '02:00PM',
        ]);
        $sa5 = SubActivity::create([
            'activity_id' => $act4->id,
            'name' => 'Unitized Curtain Wall Glazing',
            'description' => 'Facade glass panel alignment, sealant, and UCM leak testing',
            'insp_req_count' => 38,
            'scheduled_date' => '29 Nov 2023',
            'scheduled_time' => '04:00PM',
        ]);

        // 6. Defect Threshold Mappings (Exact 6 rows from Screenshot 1 + additional rows for "See All >")
        $thresholdRows = [
            [
                'project_id' => $p1->id,
                'division_id' => $d1->id,
                'sub_division_id' => $sd1->id,
                'activity_id' => $act4->id,
                'sub_activity_id' => $sa5->id,
                'defect_type' => 'UCM Leak',
                'defect_threshold' => 60,
                'sporadic_threshold' => 5,
                'chronic_threshold' => 20,
                'severity_index' => 4,
                'control_index' => 8,
            ],
            [
                'project_id' => $p2->id,
                'division_id' => $d3->id,
                'sub_division_id' => $sd4->id,
                'activity_id' => $act4->id,
                'sub_activity_id' => $sa5->id,
                'defect_type' => 'Glass Bend',
                'defect_threshold' => 70,
                'sporadic_threshold' => 3,
                'chronic_threshold' => 15,
                'severity_index' => 6,
                'control_index' => 3,
            ],
            [
                'project_id' => $p1->id,
                'division_id' => $d1->id,
                'sub_division_id' => $sd2->id,
                'activity_id' => $act3->id,
                'sub_activity_id' => $sa4->id,
                'defect_type' => 'Wire not connected',
                'defect_threshold' => 100,
                'sporadic_threshold' => 5,
                'chronic_threshold' => 10,
                'severity_index' => 8,
                'control_index' => 8,
            ],
            [
                'project_id' => $p1->id,
                'division_id' => $d1->id,
                'sub_division_id' => $sd1->id,
                'activity_id' => $act3->id,
                'sub_activity_id' => $sa4->id,
                'defect_type' => 'FCD connection issue',
                'defect_threshold' => 200,
                'sporadic_threshold' => 5,
                'chronic_threshold' => 5,
                'severity_index' => 5,
                'control_index' => 4,
            ],
            [
                'project_id' => $p1->id,
                'division_id' => $d1->id,
                'sub_division_id' => $sd1->id,
                'activity_id' => $act3->id,
                'sub_activity_id' => $sa4->id,
                'defect_type' => 'Access not provided for FCU',
                'defect_threshold' => 50,
                'sporadic_threshold' => 8,
                'chronic_threshold' => 55,
                'severity_index' => 4,
                'control_index' => 8,
            ],
            [
                'project_id' => $p1->id,
                'division_id' => $d2->id,
                'sub_division_id' => $sd3->id,
                'activity_id' => $act1->id,
                'sub_activity_id' => $sa1->id,
                'defect_type' => 'Screw missing',
                'defect_threshold' => 30,
                'sporadic_threshold' => 2,
                'chronic_threshold' => 32,
                'severity_index' => 2,
                'control_index' => 1,
            ],
            // Extra rows revealed when clicking "See All >"
            [
                'project_id' => $p2->id,
                'division_id' => $d3->id,
                'sub_division_id' => $sd4->id,
                'activity_id' => $act4->id,
                'sub_activity_id' => $sa5->id,
                'defect_type' => 'Silicone Sealant Void',
                'defect_threshold' => 45,
                'sporadic_threshold' => 4,
                'chronic_threshold' => 18,
                'severity_index' => 7,
                'control_index' => 6,
            ],
            [
                'project_id' => $p1->id,
                'division_id' => $d2->id,
                'sub_division_id' => $sd3->id,
                'activity_id' => $act2->id,
                'sub_activity_id' => $sa3->id,
                'defect_type' => 'Concrete Honeycomb > 15mm',
                'defect_threshold' => 25,
                'sporadic_threshold' => 2,
                'chronic_threshold' => 8,
                'severity_index' => 9,
                'control_index' => 7,
            ],
            [
                'project_id' => $p3->id,
                'division_id' => $d4->id,
                'sub_division_id' => $sd2->id,
                'activity_id' => $act3->id,
                'sub_activity_id' => $sa4->id,
                'defect_type' => 'Chilled Water Pipe Insulation Gap',
                'defect_threshold' => 80,
                'sporadic_threshold' => 6,
                'chronic_threshold' => 24,
                'severity_index' => 6,
                'control_index' => 5,
            ],
        ];

        foreach ($thresholdRows as $row) {
            DefectThresholdMapping::create($row);
        }

        // 7. Foremen
        $f1 = Foreman::create([
            'name' => 'Demo MEP Foreman',
            'employee_code' => 'DEMO-FM-104',
            'role' => 'Senior MEP Foreman',
            'trade' => 'HVAC & Mechanical',
            'phone' => 'Not provided',
            'project_name' => 'Sobha Hartland II',
            'active_inspections' => 7,
        ]);
        $f2 = Foreman::create([
            'name' => 'Demo Civil Foreman',
            'employee_code' => 'DEMO-FM-118',
            'role' => 'Civil Site Foreman',
            'trade' => 'Earthworks & Concrete',
            'phone' => 'Not provided',
            'project_name' => 'Sobha Hartland II',
            'active_inspections' => 6,
        ]);
        $f3 = Foreman::create([
            'name' => 'Demo Facade Foreman',
            'employee_code' => 'DEMO-FM-129',
            'role' => 'Facade QA Foreman',
            'trade' => 'Curtain Wall & Glazing',
            'phone' => 'Not provided',
            'project_name' => 'Sobha One Tower A',
            'active_inspections' => 6,
        ]);

        // 8. Seed 19 Pending Inspection Requests (matching the +19 badge in Screenshot 2)
        for ($i = 1; $i <= 19; $i++) {
            InspectionRequest::create([
                'ir_number' => sprintf('IR-2023-%04d', 100 + $i),
                'project_id' => ($i % 2 === 0) ? $p2->id : $p1->id,
                'activity_id' => ($i % 3 === 0) ? $act4->id : (($i % 2 === 0) ? $act3->id : $act1->id),
                'sub_activity_id' => ($i % 3 === 0) ? $sa5->id : (($i % 2 === 0) ? $sa4->id : $sa1->id),
                'foreman_id' => ($i % 3 === 0) ? $f3->id : (($i % 2 === 0) ? $f1->id : $f2->id),
                'location_unit' => 'Tower ' . (($i % 2 === 0) ? 'B' : 'A') . ' - Level ' . (10 + $i),
                'status' => 'Pending',
                'defects_logged' => ($i % 4),
                'requested_date' => '1 Dec 2023 | 11:00PM',
            ]);
        }
    }
}
