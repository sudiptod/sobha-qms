#!/usr/bin/env python3
"""
Local SQLite API Runner for SOBHA QMS (Port 8000).
Populates `backend/database/database.sqlite` using the exact schema & seed data from
Laravel's `2026_10_06_000001_create_qms_tables.php` and `DatabaseSeeder.php`, and
serves the identical `/api/*` REST endpoints on http://localhost:8000 when PHP/Composer
is not installed on the host machine.
"""

import json
import os
import sqlite3
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

DB_PATH = os.path.join(os.path.dirname(__file__), "database", "database.sqlite")


def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_and_seed_db():
    conn = get_db()
    cur = conn.cursor()

    cur.executescript(
        """
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            location TEXT NOT NULL,
            status TEXT DEFAULT 'Active'
        );

        CREATE TABLE IF NOT EXISTS divisions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS sub_divisions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            division_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sub_division_id INTEGER,
            name TEXT NOT NULL,
            description TEXT,
            total_sub_activities_override INTEGER DEFAULT 14,
            scheduled_date TEXT DEFAULT '1 Dec 2023',
            scheduled_time TEXT DEFAULT '11:00PM',
            FOREIGN KEY (sub_division_id) REFERENCES sub_divisions(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS sub_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            insp_req_count INTEGER DEFAULT 45,
            scheduled_date TEXT DEFAULT '18 Nov 2023',
            scheduled_time TEXT DEFAULT '11:00PM',
            FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS defect_threshold_mappings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            division_id INTEGER,
            sub_division_id INTEGER,
            activity_id INTEGER,
            sub_activity_id INTEGER,
            defect_type TEXT NOT NULL,
            defect_threshold INTEGER NOT NULL DEFAULT 50,
            sporadic_threshold INTEGER NOT NULL DEFAULT 5,
            chronic_threshold INTEGER NOT NULL DEFAULT 15,
            severity_index INTEGER NOT NULL DEFAULT 5,
            control_index INTEGER NOT NULL DEFAULT 5
        );

        CREATE TABLE IF NOT EXISTS foremen (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            employee_code TEXT UNIQUE NOT NULL,
            role TEXT DEFAULT 'Site Foreman',
            trade TEXT NOT NULL,
            phone TEXT NOT NULL,
            project_name TEXT,
            active_inspections INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS inspection_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ir_number TEXT UNIQUE NOT NULL,
            project_id INTEGER,
            activity_id INTEGER,
            sub_activity_id INTEGER,
            foreman_id INTEGER,
            location_unit TEXT NOT NULL,
            status TEXT DEFAULT 'Pending',
            defects_logged INTEGER DEFAULT 0,
            requested_date TEXT NOT NULL
        );
        """
    )

    count = cur.execute("SELECT COUNT(*) FROM projects").fetchone()[0]
    if count == 0:
        cur.executemany(
            "INSERT INTO projects (id, name, code, location, status) VALUES (?, ?, ?, ?, ?)",
            [
                (1, "Sobha Hartland II", "SHL-02", "MBR City, Dubai", "Active"),
                (2, "Sobha One Tower A", "SON-01", "Ras Al Khor, Dubai", "Active"),
                (3, "Sobha SeaHaven", "SSH-03", "Dubai Harbour", "Active"),
            ],
        )

        cur.executemany(
            "INSERT INTO divisions (id, project_id, name) VALUES (?, ?, ?)",
            [
                (1, 1, "MEP Division"),
                (2, 1, "Civil & Structural"),
                (3, 2, "Facade & Glazing"),
                (4, 3, "Interior Fit-Out"),
            ],
        )

        cur.executemany(
            "INSERT INTO sub_divisions (id, division_id, name) VALUES (?, ?, ?)",
            [
                (1, 1, "HVAC & Chilled Water"),
                (2, 1, "Electrical & LV"),
                (3, 2, "Earthworks & Substructure"),
                (4, 3, "Curtain Wall & Glazing"),
            ],
        )

        cur.executemany(
            "INSERT INTO activities (id, sub_division_id, name, description, total_sub_activities_override, scheduled_date, scheduled_time) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                (1, 3, "Site Preparation", "Lorem Ipsum Lorem Ipsum", 14, "1 Dec 2023", "11:00PM"),
                (2, 3, "Foundation Construction", "Lorem Ipsum Lorem Ipsum", 14, "1 Dec 2023", "11:00PM"),
                (3, 1, "Framing", "Lorem Ipsum Lorem Ipsum", 14, "1 Dec 2023", "11:00PM"),
                (4, 4, "Enclosure", "Lorem Ipsum Lorem Ipsum", 14, "1 Dec 2023", "11:00PM"),
            ],
        )

        cur.executemany(
            "INSERT INTO sub_activities (id, activity_id, name, description, insp_req_count, scheduled_date, scheduled_time) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                (1, 1, "Clearing and Grading", "Lorem Ipsum Lorem Ipsum", 45, "18 Nov 2023", "11:00PM"),
                (2, 1, "Clearing and Grading", "Lorem Ipsum Lorem Ipsum", 45, "18 Nov 2023", "11:00PM"),
                (3, 2, "Pile Cap & Raft Reinforcement", "Substructure rebar inspection and waterproofing membrane check", 32, "22 Nov 2023", "10:30AM"),
                (4, 3, "FCU & Ductwork First Fix", "HVAC fan coil unit mounting, valve package, and access panel verification", 28, "25 Nov 2023", "02:00PM"),
                (5, 4, "Unitized Curtain Wall Glazing", "Facade glass panel alignment, sealant, and UCM leak testing", 38, "29 Nov 2023", "04:00PM"),
            ],
        )

        cur.executemany(
            """
            INSERT INTO defect_threshold_mappings
            (id, project_id, division_id, sub_division_id, activity_id, sub_activity_id, defect_type, defect_threshold, sporadic_threshold, chronic_threshold, severity_index, control_index)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (1, 1, 1, 1, 4, 5, "UCM Leak", 60, 5, 20, 4, 8),
                (2, 2, 3, 4, 4, 5, "Glass Bend", 70, 3, 15, 6, 3),
                (3, 1, 1, 2, 3, 4, "Wire not connected", 100, 5, 10, 8, 8),
                (4, 1, 1, 1, 3, 4, "FCD connection issue", 200, 5, 5, 5, 4),
                (5, 1, 1, 1, 3, 4, "Access not provided for FCU", 50, 8, 55, 4, 8),
                (6, 1, 2, 3, 1, 1, "Screw missing", 30, 2, 32, 2, 1),
                (7, 2, 3, 4, 4, 5, "Silicone Sealant Void", 45, 4, 18, 7, 6),
                (8, 1, 2, 3, 2, 3, "Concrete Honeycomb > 15mm", 25, 2, 8, 9, 7),
                (9, 3, 4, 2, 3, 4, "Chilled Water Pipe Insulation Gap", 80, 6, 24, 6, 5),
            ],
        )

        cur.executemany(
            "INSERT INTO foremen (id, name, employee_code, role, trade, phone, project_name, active_inspections) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                (1, "Demo MEP Foreman", "DEMO-FM-104", "Senior MEP Foreman", "HVAC & Mechanical", "Not provided", "Sobha Hartland II", 7),
                (2, "Demo Civil Foreman", "DEMO-FM-118", "Civil Site Foreman", "Earthworks & Concrete", "Not provided", "Sobha Hartland II", 6),
                (3, "Demo Facade Foreman", "DEMO-FM-129", "Facade QA Foreman", "Curtain Wall & Glazing", "Not provided", "Sobha One Tower A", 6),
            ],
        )

        ir_rows = []
        for i in range(1, 20):
            ir_rows.append(
                (
                    i,
                    f"IR-2023-{100 + i:04d}",
                    2 if i % 2 == 0 else 1,
                    4 if i % 3 == 0 else (3 if i % 2 == 0 else 1),
                    5 if i % 3 == 0 else (4 if i % 2 == 0 else 1),
                    3 if i % 3 == 0 else (1 if i % 2 == 0 else 2),
                    f"Tower {'B' if i % 2 == 0 else 'A'} - Level {10 + i}",
                    "Pending",
                    i % 4,
                    "1 Dec 2023 | 11:00PM",
                )
            )
        cur.executemany(
            "INSERT INTO inspection_requests (id, ir_number, project_id, activity_id, sub_activity_id, foreman_id, location_unit, status, defects_logged, requested_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ir_rows,
        )
        conn.commit()
    conn.close()


class QMSRequestHandler(BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self._send_json({}, 200)

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        params = {k: v[0] for k, v in parse_qs(parsed.query).items() if v}
        conn = get_db()
        cur = conn.cursor()

        try:
            if path == "/api/hierarchy":
                projects = [dict(r) for r in cur.execute("SELECT * FROM projects ORDER BY id").fetchall()]
                divisions = [dict(r) for r in cur.execute("SELECT * FROM divisions ORDER BY id").fetchall()]
                sub_divisions = [dict(r) for r in cur.execute("SELECT * FROM sub_divisions ORDER BY id").fetchall()]
                activities = [dict(r) for r in cur.execute("SELECT * FROM activities ORDER BY id").fetchall()]
                sub_activities = [dict(r) for r in cur.execute("SELECT * FROM sub_activities ORDER BY id").fetchall()]
                for a in activities:
                    a["sub_activities"] = [s for s in sub_activities if s["activity_id"] == a["id"]]
                pending_ir = cur.execute("SELECT COUNT(*) FROM inspection_requests WHERE status = 'Pending'").fetchone()[0]
                defect_count = cur.execute("SELECT COUNT(*) FROM defect_threshold_mappings").fetchone()[0]
                foremen_count = cur.execute("SELECT COUNT(*) FROM foremen").fetchone()[0]
                self._send_json(
                    {
                        "projects": projects,
                        "divisions": divisions,
                        "sub_divisions": sub_divisions,
                        "activities": activities,
                        "sub_activities": sub_activities,
                        "stats": {
                            "total_projects": len(projects),
                            "total_activities": len(activities),
                            "total_sub_activities": len(sub_activities),
                            "total_defect_rules": defect_count,
                            "pending_inspection_requests": pending_ir,
                            "total_foremen": foremen_count,
                        },
                    }
                )
                return

            if path == "/api/defect-thresholds":
                sql = """
                    SELECT d.*,
                           p.name AS project_name,
                           dv.name AS division_name,
                           sd.name AS sub_division_name,
                           a.name AS activity_name,
                           sa.name AS sub_activity_name
                    FROM defect_threshold_mappings d
                    LEFT JOIN projects p ON p.id = d.project_id
                    LEFT JOIN divisions dv ON dv.id = d.division_id
                    LEFT JOIN sub_divisions sd ON sd.id = d.sub_division_id
                    LEFT JOIN activities a ON a.id = d.activity_id
                    LEFT JOIN sub_activities sa ON sa.id = d.sub_activity_id
                    WHERE 1=1
                """
                args = []
                if params.get("search"):
                    sql += " AND LOWER(d.defect_type) LIKE ?"
                    args.append(f"%{params['search'].lower()}%")
                for col in ["project_id", "division_id", "sub_division_id", "activity_id", "sub_activity_id", "severity_index", "control_index"]:
                    if params.get(col):
                        sql += f" AND d.{col} = ?"
                        args.append(int(params[col]))
                sql += " ORDER BY d.id ASC"
                rows = [dict(r) for r in cur.execute(sql, args).fetchall()]
                self._send_json(rows)
                return

            if path == "/api/activities":
                sql = "SELECT * FROM activities WHERE 1=1"
                args = []
                if params.get("parent_activity_id"):
                    sql += " AND id = ?"
                    args.append(int(params["parent_activity_id"]))
                if params.get("date"):
                    sql += " AND LOWER(scheduled_date) LIKE ?"
                    args.append(f"%{params['date'].lower()}%")
                sql += " ORDER BY id ASC"
                activities = [dict(r) for r in cur.execute(sql, args).fetchall()]
                all_subs = [dict(r) for r in cur.execute("SELECT * FROM sub_activities ORDER BY id ASC").fetchall()]
                search_q = params.get("search", "").strip().lower()
                result = []
                for act in activities:
                    subs = [s for s in all_subs if s["activity_id"] == act["id"]]
                    if search_q:
                        act_match = search_q in act["name"].lower() or search_q in (act["description"] or "").lower()
                        matching_subs = [
                            s for s in subs if search_q in s["name"].lower() or search_q in (s["description"] or "").lower()
                        ]
                        if not act_match and not matching_subs:
                            continue
                        if matching_subs and not act_match:
                            subs = matching_subs
                    act["sub_activities"] = subs
                    result.append(act)
                self._send_json(result)
                return

            if path == "/api/inspection-requests":
                sql = """
                    SELECT ir.*,
                           p.name AS project_name,
                           a.name AS activity_name,
                           sa.name AS sub_activity_name,
                           f.name AS foreman_name
                    FROM inspection_requests ir
                    LEFT JOIN projects p ON p.id = ir.project_id
                    LEFT JOIN activities a ON a.id = ir.activity_id
                    LEFT JOIN sub_activities sa ON sa.id = ir.sub_activity_id
                    LEFT JOIN foremen f ON f.id = ir.foreman_id
                    WHERE 1=1
                """
                args = []
                if params.get("sub_activity_id"):
                    sql += " AND ir.sub_activity_id = ?"
                    args.append(int(params["sub_activity_id"]))
                if params.get("status"):
                    sql += " AND ir.status = ?"
                    args.append(params["status"])
                sql += " ORDER BY ir.id DESC"
                rows = [dict(r) for r in cur.execute(sql, args).fetchall()]
                self._send_json(rows)
                return

            if path == "/api/foremen":
                rows = [dict(r) for r in cur.execute("SELECT * FROM foremen ORDER BY id ASC").fetchall()]
                self._send_json(rows)
                return

            self._send_json({"error": "Not found"}, 404)
        finally:
            conn.close()

    def do_POST(self):
        path = urlparse(self.path).path
        body = self._read_body()
        conn = get_db()
        cur = conn.cursor()
        try:
            if path == "/api/defect-thresholds":
                cur.execute(
                    """
                    INSERT INTO defect_threshold_mappings
                    (project_id, division_id, sub_division_id, activity_id, sub_activity_id, defect_type, defect_threshold, sporadic_threshold, chronic_threshold, severity_index, control_index)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        body.get("project_id") or 1,
                        body.get("division_id") or 1,
                        body.get("sub_division_id") or 1,
                        body.get("activity_id") or 1,
                        body.get("sub_activity_id") or 1,
                        body.get("defect_type", "New Defect"),
                        int(body.get("defect_threshold", 50)),
                        int(body.get("sporadic_threshold", 5)),
                        int(body.get("chronic_threshold", 15)),
                        int(body.get("severity_index", 5)),
                        int(body.get("control_index", 5)),
                    ),
                )
                conn.commit()
                new_id = cur.lastrowid
                row = dict(cur.execute("SELECT * FROM defect_threshold_mappings WHERE id = ?", (new_id,)).fetchone())
                self._send_json(row, 201)
                return

            if path == "/api/activities":
                cur.execute(
                    """
                    INSERT INTO activities (sub_division_id, name, description, total_sub_activities_override, scheduled_date, scheduled_time)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        body.get("sub_division_id") or 1,
                        body.get("name", "New Activity"),
                        body.get("description") or "Lorem Ipsum Lorem Ipsum",
                        int(body.get("total_sub_activities_override") or 14),
                        body.get("scheduled_date") or "1 Dec 2023",
                        body.get("scheduled_time") or "11:00PM",
                    ),
                )
                conn.commit()
                new_id = cur.lastrowid
                act = dict(cur.execute("SELECT * FROM activities WHERE id = ?", (new_id,)).fetchone())
                act["sub_activities"] = []
                self._send_json(act, 201)
                return

            if path == "/api/sub-activities":
                cur.execute(
                    """
                    INSERT INTO sub_activities (activity_id, name, description, insp_req_count, scheduled_date, scheduled_time)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        int(body.get("activity_id", 1)),
                        body.get("name", "New Sub Activity"),
                        body.get("description") or "Lorem Ipsum Lorem Ipsum",
                        int(body.get("insp_req_count", 45)),
                        body.get("scheduled_date") or "18 Nov 2023",
                        body.get("scheduled_time") or "11:00PM",
                    ),
                )
                conn.commit()
                new_id = cur.lastrowid
                row = dict(cur.execute("SELECT * FROM sub_activities WHERE id = ?", (new_id,)).fetchone())
                self._send_json(row, 201)
                return

            self._send_json({"error": "Not found"}, 404)
        finally:
            conn.close()

    def do_PUT(self):
        path = urlparse(self.path).path
        body = self._read_body()
        conn = get_db()
        cur = conn.cursor()
        try:
            if path.startswith("/api/defect-thresholds/"):
                row_id = int(path.split("/")[-1])
                existing = cur.execute("SELECT * FROM defect_threshold_mappings WHERE id = ?", (row_id,)).fetchone()
                if not existing:
                    self._send_json({"error": "Not found"}, 404)
                    return
                data = dict(existing)
                data.update({k: v for k, v in body.items() if v is not None})
                cur.execute(
                    """
                    UPDATE defect_threshold_mappings
                    SET project_id = ?, division_id = ?, sub_division_id = ?, activity_id = ?, sub_activity_id = ?,
                        defect_type = ?, defect_threshold = ?, sporadic_threshold = ?, chronic_threshold = ?,
                        severity_index = ?, control_index = ?
                    WHERE id = ?
                    """,
                    (
                        data["project_id"],
                        data["division_id"],
                        data["sub_division_id"],
                        data["activity_id"],
                        data["sub_activity_id"],
                        data["defect_type"],
                        int(data["defect_threshold"]),
                        int(data["sporadic_threshold"]),
                        int(data["chronic_threshold"]),
                        int(data["severity_index"]),
                        int(data["control_index"]),
                        row_id,
                    ),
                )
                conn.commit()
                updated = dict(cur.execute("SELECT * FROM defect_threshold_mappings WHERE id = ?", (row_id,)).fetchone())
                self._send_json(updated)
                return

            if path.startswith("/api/sub-activities/"):
                row_id = int(path.split("/")[-1])
                existing = cur.execute("SELECT * FROM sub_activities WHERE id = ?", (row_id,)).fetchone()
                if not existing:
                    self._send_json({"error": "Not found"}, 404)
                    return
                data = dict(existing)
                data.update({k: v for k, v in body.items() if v is not None})
                cur.execute(
                    """
                    UPDATE sub_activities
                    SET name = ?, description = ?, insp_req_count = ?, scheduled_date = ?, scheduled_time = ?
                    WHERE id = ?
                    """,
                    (
                        data["name"],
                        data["description"],
                        int(data["insp_req_count"]),
                        data["scheduled_date"],
                        data["scheduled_time"],
                        row_id,
                    ),
                )
                conn.commit()
                updated = dict(cur.execute("SELECT * FROM sub_activities WHERE id = ?", (row_id,)).fetchone())
                self._send_json(updated)
                return

            if path.startswith("/api/inspection-requests/"):
                row_id = int(path.split("/")[-1])
                existing = cur.execute("SELECT * FROM inspection_requests WHERE id = ?", (row_id,)).fetchone()
                if not existing:
                    self._send_json({"error": "Not found"}, 404)
                    return
                data = dict(existing)
                data.update({k: v for k, v in body.items() if v is not None})
                cur.execute(
                    "UPDATE inspection_requests SET status = ?, defects_logged = ? WHERE id = ?",
                    (data["status"], int(data["defects_logged"]), row_id),
                )
                conn.commit()
                updated = dict(cur.execute("SELECT * FROM inspection_requests WHERE id = ?", (row_id,)).fetchone())
                self._send_json(updated)
                return

            self._send_json({"error": "Not found"}, 404)
        finally:
            conn.close()

    def do_DELETE(self):
        path = urlparse(self.path).path
        conn = get_db()
        cur = conn.cursor()
        try:
            if path.startswith("/api/defect-thresholds/"):
                row_id = int(path.split("/")[-1])
                cur.execute("DELETE FROM defect_threshold_mappings WHERE id = ?", (row_id,))
                conn.commit()
                self._send_json({"deleted": True, "id": row_id})
                return

            if path.startswith("/api/sub-activities/"):
                row_id = int(path.split("/")[-1])
                cur.execute("DELETE FROM sub_activities WHERE id = ?", (row_id,))
                conn.commit()
                self._send_json({"deleted": True, "id": row_id})
                return

            self._send_json({"error": "Not found"}, 404)
        finally:
            conn.close()


if __name__ == "__main__":
    init_and_seed_db()
    port = int(os.environ.get("PORT", "8000"))
    server = HTTPServer(("127.0.0.1", port), QMSRequestHandler)
    print(f"SOBHA QMS SQLite API Server listening on http://127.0.0.1:{port}")
    server.serve_forever()
