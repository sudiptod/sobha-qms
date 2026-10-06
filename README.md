# SOBHA Construction Quality & Defect Management System (QIMS)

Full-stack Construction Quality & Inspection Management application built from the reference screens:
1. **Defect Threshold Mapping (Screen 1)** — 7-parameter cascading WBS filter bar (`Project → Division → Sub-Division → Activity → Sub-Activity → Severity → Control`), inline & modal threshold editing, and pagination (`See All >`).
2. **All Activities & Sub-Activities (Screen 2)** — Parent Activity & Date filter bar, `+ Add New Activity` modal, and expandable accordion table with nested Sub-Activities and Inspection Request (`Insp. Req. Count`) tracking.

## Tech Stack
* **Frontend**: React.js 18, TypeScript, Vite, Tailwind CSS v4, Lucide Icons (`/frontend`)
* **Backend**: PHP 8.2+ Laravel 12 REST API (`/backend`) with Eloquent ORM, Migrations, DatabaseSeeder, and SQLite/MySQL persistence.

## Running the Project

### 1. Start the Backend API (`http://localhost:8000`)
**With PHP / Laravel installed:**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```
*(Or using the built-in PHP 8 server directly against `database/database.sqlite`: `php -S localhost:8000 -t public`)*

**Local SQLite Runner (if PHP is not installed on macOS yet):**
```bash
python3 backend/dev_sqlite_server.py
```

### 2. Start the React Frontend (`http://localhost:5173`)
```bash
cd frontend
npm install
npm run dev
```
