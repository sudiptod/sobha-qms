<?php

declare(strict_types=1);

/**
 * SOBHA QMS Backend Entrypoint (Laravel 11 + Standalone PHP 8 PDO SQLite Engine)
 *
 * 1. If Composer dependencies are installed (`vendor/autoload.php`), boots the full
 *    Laravel 11 application (`routes/api.php`, Eloquent Models, Controllers).
 * 2. Otherwise, serves the exact same REST API endpoints directly via PHP 8 PDO
 *    against `database/database.sqlite` so `php -S localhost:8000 -t public` works immediately.
 */

if (file_exists(__DIR__ . '/../vendor/autoload.php') && file_exists(__DIR__ . '/../bootstrap/app.php')) {
    require __DIR__ . '/../vendor/autoload.php';
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    $app->handleRequest(Illuminate\Http\Request::capture());
    exit;
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dbPath = __DIR__ . '/../database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input') ?: '{}', true) ?? [];

// GET /api/hierarchy
if ($uri === '/api/hierarchy' && $method === 'GET') {
    $projects = $pdo->query('SELECT * FROM projects ORDER BY id')->fetchAll();
    $divisions = $pdo->query('SELECT * FROM divisions ORDER BY id')->fetchAll();
    $subDivisions = $pdo->query('SELECT * FROM sub_divisions ORDER BY id')->fetchAll();
    $activities = $pdo->query('SELECT * FROM activities ORDER BY id')->fetchAll();
    $subActivities = $pdo->query('SELECT * FROM sub_activities ORDER BY id')->fetchAll();

    foreach ($activities as &$act) {
        $act['sub_activities'] = array_values(array_filter(
            $subActivities,
            fn ($sa) => (int) $sa['activity_id'] === (int) $act['id']
        ));
    }

    $pendingIr = (int) $pdo->query("SELECT COUNT(*) FROM inspection_requests WHERE status = 'Pending'")->fetchColumn();
    $defectCount = (int) $pdo->query('SELECT COUNT(*) FROM defect_threshold_mappings')->fetchColumn();
    $foremenCount = (int) $pdo->query('SELECT COUNT(*) FROM foremen')->fetchColumn();

    echo json_encode([
        'projects' => $projects,
        'divisions' => $divisions,
        'sub_divisions' => $subDivisions,
        'activities' => $activities,
        'sub_activities' => $subActivities,
        'stats' => [
            'total_projects' => count($projects),
            'total_activities' => count($activities),
            'total_sub_activities' => count($subActivities),
            'total_defect_rules' => $defectCount,
            'pending_inspection_requests' => $pendingIr,
            'total_foremen' => $foremenCount,
        ],
    ]);
    exit;
}

// GET & POST /api/defect-thresholds
if ($uri === '/api/defect-thresholds') {
    if ($method === 'GET') {
        $sql = 'SELECT d.*, p.name AS project_name, dv.name AS division_name, sd.name AS sub_division_name,
                       a.name AS activity_name, sa.name AS sub_activity_name
                FROM defect_threshold_mappings d
                LEFT JOIN projects p ON p.id = d.project_id
                LEFT JOIN divisions dv ON dv.id = d.division_id
                LEFT JOIN sub_divisions sd ON sd.id = d.sub_division_id
                LEFT JOIN activities a ON a.id = d.activity_id
                LEFT JOIN sub_activities sa ON sa.id = d.sub_activity_id
                WHERE 1=1';
        $params = [];

        if (!empty($_GET['search'])) {
            $sql .= ' AND LOWER(d.defect_type) LIKE :search';
            $params[':search'] = '%' . strtolower((string) $_GET['search']) . '%';
        }
        foreach (['project_id', 'division_id', 'sub_division_id', 'activity_id', 'sub_activity_id', 'severity_index', 'control_index'] as $col) {
            if (!empty($_GET[$col])) {
                $sql .= " AND d.{$col} = :{$col}";
                $params[":{$col}"] = (int) $_GET[$col];
            }
        }
        $sql .= ' ORDER BY d.id ASC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll());
        exit;
    }

    if ($method === 'POST') {
        $stmt = $pdo->prepare(
            'INSERT INTO defect_threshold_mappings
             (project_id, division_id, sub_division_id, activity_id, sub_activity_id, defect_type, defect_threshold, sporadic_threshold, chronic_threshold, severity_index, control_index)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $body['project_id'] ?? 1,
            $body['division_id'] ?? 1,
            $body['sub_division_id'] ?? 1,
            $body['activity_id'] ?? 1,
            $body['sub_activity_id'] ?? 1,
            $body['defect_type'] ?? 'New Defect',
            (int) ($body['defect_threshold'] ?? 50),
            (int) ($body['sporadic_threshold'] ?? 5),
            (int) ($body['chronic_threshold'] ?? 15),
            (int) ($body['severity_index'] ?? 5),
            (int) ($body['control_index'] ?? 5),
        ]);
        $id = (int) $pdo->lastInsertId();
        $row = $pdo->query("SELECT * FROM defect_threshold_mappings WHERE id = {$id}")->fetch();
        http_response_code(201);
        echo json_encode($row);
        exit;
    }
}

// PUT & DELETE /api/defect-thresholds/{id}
if (preg_match('#^/api/defect-thresholds/(\d+)$#', $uri, $m)) {
    $id = (int) $m[1];
    if ($method === 'PUT') {
        $existing = $pdo->query("SELECT * FROM defect_threshold_mappings WHERE id = {$id}")->fetch();
        $merged = array_merge($existing ?: [], $body);
        $stmt = $pdo->prepare(
            'UPDATE defect_threshold_mappings
             SET project_id = ?, division_id = ?, sub_division_id = ?, activity_id = ?, sub_activity_id = ?,
                 defect_type = ?, defect_threshold = ?, sporadic_threshold = ?, chronic_threshold = ?,
                 severity_index = ?, control_index = ?
             WHERE id = ?'
        );
        $stmt->execute([
            $merged['project_id'],
            $merged['division_id'],
            $merged['sub_division_id'],
            $merged['activity_id'],
            $merged['sub_activity_id'],
            $merged['defect_type'],
            (int) $merged['defect_threshold'],
            (int) $merged['sporadic_threshold'],
            (int) $merged['chronic_threshold'],
            (int) $merged['severity_index'],
            (int) $merged['control_index'],
            $id,
        ]);
        echo json_encode($pdo->query("SELECT * FROM defect_threshold_mappings WHERE id = {$id}")->fetch());
        exit;
    }
    if ($method === 'DELETE') {
        $pdo->prepare('DELETE FROM defect_threshold_mappings WHERE id = ?')->execute([$id]);
        echo json_encode(['deleted' => true, 'id' => $id]);
        exit;
    }
}

// GET & POST /api/activities
if ($uri === '/api/activities') {
    if ($method === 'GET') {
        $activities = $pdo->query('SELECT * FROM activities ORDER BY id ASC')->fetchAll();
        $subActivities = $pdo->query('SELECT * FROM sub_activities ORDER BY id ASC')->fetchAll();
        foreach ($activities as &$act) {
            $act['sub_activities'] = array_values(array_filter(
                $subActivities,
                fn ($sa) => (int) $sa['activity_id'] === (int) $act['id']
            ));
        }
        echo json_encode($activities);
        exit;
    }
    if ($method === 'POST') {
        $stmt = $pdo->prepare(
            'INSERT INTO activities (sub_division_id, name, description, total_sub_activities_override, scheduled_date, scheduled_time)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $body['sub_division_id'] ?? 1,
            $body['name'] ?? 'New Activity',
            $body['description'] ?? 'Lorem Ipsum Lorem Ipsum',
            (int) ($body['total_sub_activities_override'] ?? 14),
            $body['scheduled_date'] ?? '1 Dec 2023',
            $body['scheduled_time'] ?? '11:00PM',
        ]);
        $id = (int) $pdo->lastInsertId();
        $act = $pdo->query("SELECT * FROM activities WHERE id = {$id}")->fetch();
        $act['sub_activities'] = [];
        http_response_code(201);
        echo json_encode($act);
        exit;
    }
}

// POST /api/sub-activities & PUT/DELETE /api/sub-activities/{id}
if ($uri === '/api/sub-activities' && $method === 'POST') {
    $stmt = $pdo->prepare(
        'INSERT INTO sub_activities (activity_id, name, description, insp_req_count, scheduled_date, scheduled_time)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        (int) ($body['activity_id'] ?? 1),
        $body['name'] ?? 'New Sub Activity',
        $body['description'] ?? 'Lorem Ipsum Lorem Ipsum',
        (int) ($body['insp_req_count'] ?? 45),
        $body['scheduled_date'] ?? '18 Nov 2023',
        $body['scheduled_time'] ?? '11:00PM',
    ]);
    $id = (int) $pdo->lastInsertId();
    http_response_code(201);
    echo json_encode($pdo->query("SELECT * FROM sub_activities WHERE id = {$id}")->fetch());
    exit;
}

if (preg_match('#^/api/sub-activities/(\d+)$#', $uri, $m)) {
    $id = (int) $m[1];
    if ($method === 'PUT') {
        $existing = $pdo->query("SELECT * FROM sub_activities WHERE id = {$id}")->fetch();
        $merged = array_merge($existing ?: [], $body);
        $stmt = $pdo->prepare(
            'UPDATE sub_activities SET name = ?, description = ?, insp_req_count = ?, scheduled_date = ?, scheduled_time = ? WHERE id = ?'
        );
        $stmt->execute([
            $merged['name'],
            $merged['description'],
            (int) $merged['insp_req_count'],
            $merged['scheduled_date'],
            $merged['scheduled_time'],
            $id,
        ]);
        echo json_encode($pdo->query("SELECT * FROM sub_activities WHERE id = {$id}")->fetch());
        exit;
    }
    if ($method === 'DELETE') {
        $pdo->prepare('DELETE FROM sub_activities WHERE id = ?')->execute([$id]);
        echo json_encode(['deleted' => true, 'id' => $id]);
        exit;
    }
}

// GET /api/inspection-requests & /api/foremen
if ($uri === '/api/inspection-requests' && $method === 'GET') {
    $rows = $pdo->query(
        'SELECT ir.*, p.name AS project_name, a.name AS activity_name, sa.name AS sub_activity_name, f.name AS foreman_name
         FROM inspection_requests ir
         LEFT JOIN projects p ON p.id = ir.project_id
         LEFT JOIN activities a ON a.id = ir.activity_id
         LEFT JOIN sub_activities sa ON sa.id = ir.sub_activity_id
         LEFT JOIN foremen f ON f.id = ir.foreman_id
         ORDER BY ir.id DESC'
    )->fetchAll();
    echo json_encode($rows);
    exit;
}

if ($uri === '/api/foremen' && $method === 'GET') {
    echo json_encode($pdo->query('SELECT * FROM foremen ORDER BY id ASC')->fetchAll());
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Route not found', 'path' => $uri]);
