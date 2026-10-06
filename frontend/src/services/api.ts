export interface Project {
  id: number;
  name: string;
  code: string;
  location: string;
  status: string;
}

export interface Division {
  id: number;
  project_id: number;
  name: string;
}

export interface SubDivision {
  id: number;
  division_id: number;
  name: string;
}

export interface SubActivity {
  id: number;
  activity_id: number;
  name: string;
  description: string;
  insp_req_count: number;
  scheduled_date: string;
  scheduled_time: string;
}

export interface Activity {
  id: number;
  sub_division_id: number | null;
  name: string;
  description: string;
  total_sub_activities_override?: number;
  scheduled_date: string;
  scheduled_time: string;
  sub_activities: SubActivity[];
}

export interface DefectThresholdMapping {
  id: number;
  project_id: number | null;
  division_id: number | null;
  sub_division_id: number | null;
  activity_id: number | null;
  sub_activity_id: number | null;
  project_name?: string;
  division_name?: string;
  sub_division_name?: string;
  activity_name?: string;
  sub_activity_name?: string;
  defect_type: string;
  defect_threshold: number;
  sporadic_threshold: number;
  chronic_threshold: number;
  severity_index: number;
  control_index: number;
}

export interface Foreman {
  id: number;
  name: string;
  employee_code: string;
  role: string;
  trade: string;
  phone: string;
  project_name: string;
  active_inspections: number;
}

export interface InspectionRequest {
  id: number;
  ir_number: string;
  project_id: number;
  activity_id: number;
  sub_activity_id: number;
  foreman_id: number;
  project_name?: string;
  activity_name?: string;
  sub_activity_name?: string;
  foreman_name?: string;
  location_unit: string;
  status: 'Pending' | 'In Review' | 'Approved' | 'Rejected';
  defects_logged: number;
  requested_date: string;
}

export interface HierarchyPayload {
  projects: Project[];
  divisions: Division[];
  sub_divisions: SubDivision[];
  activities: Activity[];
  sub_activities: SubActivity[];
  stats: {
    total_projects: number;
    total_activities: number;
    total_sub_activities: number;
    total_defect_rules: number;
    pending_inspection_requests: number;
    total_foremen: number;
  };
}

export interface DefectThresholdFilters {
  search?: string;
  project_id?: string;
  division_id?: string;
  sub_division_id?: string;
  activity_id?: string;
  sub_activity_id?: string;
  severity_index?: string;
  control_index?: string;
}

const API_BASE = 'http://127.0.0.1:8000/api';
const STORAGE_KEY = 'sobha_qms_store_v1';

interface LocalStore {
  projects: Project[];
  divisions: Division[];
  sub_divisions: SubDivision[];
  activities: Omit<Activity, 'sub_activities'>[];
  sub_activities: SubActivity[];
  defect_thresholds: DefectThresholdMapping[];
  foremen: Foreman[];
  inspection_requests: InspectionRequest[];
}

function getInitialStore(): LocalStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore storage errors
  }

  const projects: Project[] = [
    { id: 1, name: 'Sobha Hartland II', code: 'SHL-02', location: 'MBR City, Dubai', status: 'Active' },
    { id: 2, name: 'Sobha One Tower A', code: 'SON-01', location: 'Ras Al Khor, Dubai', status: 'Active' },
    { id: 3, name: 'Sobha SeaHaven', code: 'SSH-03', location: 'Dubai Harbour', status: 'Active' },
  ];

  const divisions: Division[] = [
    { id: 1, project_id: 1, name: 'MEP Division' },
    { id: 2, project_id: 1, name: 'Civil & Structural' },
    { id: 3, project_id: 2, name: 'Facade & Glazing' },
    { id: 4, project_id: 3, name: 'Interior Fit-Out' },
  ];

  const sub_divisions: SubDivision[] = [
    { id: 1, division_id: 1, name: 'HVAC & Chilled Water' },
    { id: 2, division_id: 1, name: 'Electrical & LV' },
    { id: 3, division_id: 2, name: 'Earthworks & Substructure' },
    { id: 4, division_id: 3, name: 'Curtain Wall & Glazing' },
  ];

  const activities: Omit<Activity, 'sub_activities'>[] = [
    {
      id: 1,
      sub_division_id: 3,
      name: 'Site Preparation',
      description: 'Lorem Ipsum Lorem Ipsum',
      total_sub_activities_override: 14,
      scheduled_date: '1 Dec 2023',
      scheduled_time: '11:00PM',
    },
    {
      id: 2,
      sub_division_id: 3,
      name: 'Foundation Construction',
      description: 'Lorem Ipsum Lorem Ipsum',
      total_sub_activities_override: 14,
      scheduled_date: '1 Dec 2023',
      scheduled_time: '11:00PM',
    },
    {
      id: 3,
      sub_division_id: 1,
      name: 'Framing',
      description: 'Lorem Ipsum Lorem Ipsum',
      total_sub_activities_override: 14,
      scheduled_date: '1 Dec 2023',
      scheduled_time: '11:00PM',
    },
    {
      id: 4,
      sub_division_id: 4,
      name: 'Enclosure',
      description: 'Lorem Ipsum Lorem Ipsum',
      total_sub_activities_override: 14,
      scheduled_date: '1 Dec 2023',
      scheduled_time: '11:00PM',
    },
  ];

  const sub_activities: SubActivity[] = [
    {
      id: 1,
      activity_id: 1,
      name: 'Clearing and Grading',
      description: 'Lorem Ipsum Lorem Ipsum',
      insp_req_count: 45,
      scheduled_date: '18 Nov 2023',
      scheduled_time: '11:00PM',
    },
    {
      id: 2,
      activity_id: 1,
      name: 'Clearing and Grading',
      description: 'Lorem Ipsum Lorem Ipsum',
      insp_req_count: 45,
      scheduled_date: '18 Nov 2023',
      scheduled_time: '11:00PM',
    },
    {
      id: 3,
      activity_id: 2,
      name: 'Pile Cap & Raft Reinforcement',
      description: 'Substructure rebar inspection and waterproofing membrane check',
      insp_req_count: 32,
      scheduled_date: '22 Nov 2023',
      scheduled_time: '10:30AM',
    },
    {
      id: 4,
      activity_id: 3,
      name: 'FCU & Ductwork First Fix',
      description: 'HVAC fan coil unit mounting, valve package, and access panel verification',
      insp_req_count: 28,
      scheduled_date: '25 Nov 2023',
      scheduled_time: '02:00PM',
    },
    {
      id: 5,
      activity_id: 4,
      name: 'Unitized Curtain Wall Glazing',
      description: 'Facade glass panel alignment, sealant, and UCM leak testing',
      insp_req_count: 38,
      scheduled_date: '29 Nov 2023',
      scheduled_time: '04:00PM',
    },
  ];

  const defect_thresholds: DefectThresholdMapping[] = [
    {
      id: 1,
      project_id: 1,
      division_id: 1,
      sub_division_id: 1,
      activity_id: 4,
      sub_activity_id: 5,
      defect_type: 'UCM Leak',
      defect_threshold: 60,
      sporadic_threshold: 5,
      chronic_threshold: 20,
      severity_index: 4,
      control_index: 8,
    },
    {
      id: 2,
      project_id: 2,
      division_id: 3,
      sub_division_id: 4,
      activity_id: 4,
      sub_activity_id: 5,
      defect_type: 'Glass Bend',
      defect_threshold: 70,
      sporadic_threshold: 3,
      chronic_threshold: 15,
      severity_index: 6,
      control_index: 3,
    },
    {
      id: 3,
      project_id: 1,
      division_id: 1,
      sub_division_id: 2,
      activity_id: 3,
      sub_activity_id: 4,
      defect_type: 'Wire not connected',
      defect_threshold: 100,
      sporadic_threshold: 5,
      chronic_threshold: 10,
      severity_index: 8,
      control_index: 8,
    },
    {
      id: 4,
      project_id: 1,
      division_id: 1,
      sub_division_id: 1,
      activity_id: 3,
      sub_activity_id: 4,
      defect_type: 'FCD connection issue',
      defect_threshold: 200,
      sporadic_threshold: 5,
      chronic_threshold: 5,
      severity_index: 5,
      control_index: 4,
    },
    {
      id: 5,
      project_id: 1,
      division_id: 1,
      sub_division_id: 1,
      activity_id: 3,
      sub_activity_id: 4,
      defect_type: 'Access not provided for FCU',
      defect_threshold: 50,
      sporadic_threshold: 8,
      chronic_threshold: 55,
      severity_index: 4,
      control_index: 8,
    },
    {
      id: 6,
      project_id: 1,
      division_id: 2,
      sub_division_id: 3,
      activity_id: 1,
      sub_activity_id: 1,
      defect_type: 'Screw missing',
      defect_threshold: 30,
      sporadic_threshold: 2,
      chronic_threshold: 32,
      severity_index: 2,
      control_index: 1,
    },
    {
      id: 7,
      project_id: 2,
      division_id: 3,
      sub_division_id: 4,
      activity_id: 4,
      sub_activity_id: 5,
      defect_type: 'Silicone Sealant Void',
      defect_threshold: 45,
      sporadic_threshold: 4,
      chronic_threshold: 18,
      severity_index: 7,
      control_index: 6,
    },
    {
      id: 8,
      project_id: 1,
      division_id: 2,
      sub_division_id: 3,
      activity_id: 2,
      sub_activity_id: 3,
      defect_type: 'Concrete Honeycomb > 15mm',
      defect_threshold: 25,
      sporadic_threshold: 2,
      chronic_threshold: 8,
      severity_index: 9,
      control_index: 7,
    },
    {
      id: 9,
      project_id: 3,
      division_id: 4,
      sub_division_id: 2,
      activity_id: 3,
      sub_activity_id: 4,
      defect_type: 'Chilled Water Pipe Insulation Gap',
      defect_threshold: 80,
      sporadic_threshold: 6,
      chronic_threshold: 24,
      severity_index: 6,
      control_index: 5,
    },
  ];

  const foremen: Foreman[] = [
    {
      id: 1,
      name: 'Demo MEP Foreman',
      employee_code: 'DEMO-FM-104',
      role: 'Senior MEP Foreman',
      trade: 'HVAC & Mechanical',
      phone: 'Not provided',
      project_name: 'Sobha Hartland II',
      active_inspections: 7,
    },
    {
      id: 2,
      name: 'Demo Civil Foreman',
      employee_code: 'DEMO-FM-118',
      role: 'Civil Site Foreman',
      trade: 'Earthworks & Concrete',
      phone: 'Not provided',
      project_name: 'Sobha Hartland II',
      active_inspections: 6,
    },
    {
      id: 3,
      name: 'Demo Facade Foreman',
      employee_code: 'DEMO-FM-129',
      role: 'Facade QA Foreman',
      trade: 'Curtain Wall & Glazing',
      phone: 'Not provided',
      project_name: 'Sobha One Tower A',
      active_inspections: 6,
    },
  ];

  const inspection_requests: InspectionRequest[] = Array.from({ length: 19 }, (_, idx) => {
    const i = idx + 1;
    const pId = i % 2 === 0 ? 2 : 1;
    const aId = i % 3 === 0 ? 4 : i % 2 === 0 ? 3 : 1;
    const saId = i % 3 === 0 ? 5 : i % 2 === 0 ? 4 : 1;
    const fId = i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2;
    return {
      id: i,
      ir_number: `IR-2023-0${100 + i}`,
      project_id: pId,
      activity_id: aId,
      sub_activity_id: saId,
      foreman_id: fId,
      project_name: projects.find((p) => p.id === pId)?.name,
      activity_name: activities.find((a) => a.id === aId)?.name,
      sub_activity_name: sub_activities.find((s) => s.id === saId)?.name,
      foreman_name: foremen.find((f) => f.id === fId)?.name,
      location_unit: `Tower ${i % 2 === 0 ? 'B' : 'A'} - Level ${10 + i}`,
      status: 'Pending',
      defects_logged: i % 4,
      requested_date: '1 Dec 2023 | 11:00PM',
    };
  });

  const store: LocalStore = {
    projects,
    divisions,
    sub_divisions,
    activities,
    sub_activities,
    defect_thresholds,
    foremen,
    inspection_requests,
  };
  saveStore(store);
  return store;
}

function saveStore(store: LocalStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export const qmsApi = {
  async getHierarchy(): Promise<HierarchyPayload> {
    try {
      return await requestJson<HierarchyPayload>('/hierarchy');
    } catch {
      const s = getInitialStore();
      const acts: Activity[] = s.activities.map((a) => ({
        ...a,
        sub_activities: s.sub_activities.filter((sa) => sa.activity_id === a.id),
      }));
      return {
        projects: s.projects,
        divisions: s.divisions,
        sub_divisions: s.sub_divisions,
        activities: acts,
        sub_activities: s.sub_activities,
        stats: {
          total_projects: s.projects.length,
          total_activities: s.activities.length,
          total_sub_activities: s.sub_activities.length,
          total_defect_rules: s.defect_thresholds.length,
          pending_inspection_requests: s.inspection_requests.filter(
            (ir) => ir.status === 'Pending'
          ).length,
          total_foremen: s.foremen.length,
        },
      };
    }
  },

  async getDefectThresholds(
    filters: DefectThresholdFilters = {}
  ): Promise<DefectThresholdMapping[]> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') {
          params.set(k, String(v));
        }
      });
      const qs = params.toString();
      return await requestJson<DefectThresholdMapping[]>(
        `/defect-thresholds${qs ? `?${qs}` : ''}`
      );
    } catch {
      const s = getInitialStore();
      return s.defect_thresholds
        .map((d) => ({
          ...d,
          project_name: s.projects.find((p) => p.id === d.project_id)?.name,
          division_name: s.divisions.find((dv) => dv.id === d.division_id)?.name,
          sub_division_name: s.sub_divisions.find((sd) => sd.id === d.sub_division_id)?.name,
          activity_name: s.activities.find((a) => a.id === d.activity_id)?.name,
          sub_activity_name: s.sub_activities.find((sa) => sa.id === d.sub_activity_id)?.name,
        }))
        .filter((d) => {
          if (
            filters.search &&
            !d.defect_type.toLowerCase().includes(filters.search.toLowerCase())
          ) {
            return false;
          }
          if (filters.project_id && String(d.project_id) !== String(filters.project_id))
            return false;
          if (filters.division_id && String(d.division_id) !== String(filters.division_id))
            return false;
          if (
            filters.sub_division_id &&
            String(d.sub_division_id) !== String(filters.sub_division_id)
          )
            return false;
          if (filters.activity_id && String(d.activity_id) !== String(filters.activity_id))
            return false;
          if (
            filters.sub_activity_id &&
            String(d.sub_activity_id) !== String(filters.sub_activity_id)
          )
            return false;
          if (
            filters.severity_index &&
            String(d.severity_index) !== String(filters.severity_index)
          )
            return false;
          if (
            filters.control_index &&
            String(d.control_index) !== String(filters.control_index)
          )
            return false;
          return true;
        });
    }
  },

  async createDefectThreshold(
    payload: Partial<DefectThresholdMapping>
  ): Promise<DefectThresholdMapping> {
    try {
      return await requestJson<DefectThresholdMapping>('/defect-thresholds', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const s = getInitialStore();
      const nextId =
        s.defect_thresholds.reduce((max, r) => Math.max(max, r.id), 0) + 1;
      const created: DefectThresholdMapping = {
        id: nextId,
        project_id: payload.project_id ?? 1,
        division_id: payload.division_id ?? 1,
        sub_division_id: payload.sub_division_id ?? 1,
        activity_id: payload.activity_id ?? 1,
        sub_activity_id: payload.sub_activity_id ?? 1,
        defect_type: payload.defect_type || 'New Defect',
        defect_threshold: Number(payload.defect_threshold ?? 50),
        sporadic_threshold: Number(payload.sporadic_threshold ?? 5),
        chronic_threshold: Number(payload.chronic_threshold ?? 15),
        severity_index: Number(payload.severity_index ?? 5),
        control_index: Number(payload.control_index ?? 5),
      };
      s.defect_thresholds.push(created);
      saveStore(s);
      return created;
    }
  },

  async updateDefectThreshold(
    id: number,
    payload: Partial<DefectThresholdMapping>
  ): Promise<DefectThresholdMapping> {
    try {
      return await requestJson<DefectThresholdMapping>(`/defect-thresholds/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch {
      const s = getInitialStore();
      const idx = s.defect_thresholds.findIndex((r) => r.id === id);
      if (idx !== -1) {
        s.defect_thresholds[idx] = { ...s.defect_thresholds[idx], ...payload };
        saveStore(s);
        return s.defect_thresholds[idx];
      }
      throw new Error('Not found');
    }
  },

  async deleteDefectThreshold(id: number): Promise<{ deleted: boolean; id: number }> {
    try {
      return await requestJson<{ deleted: boolean; id: number }>(
        `/defect-thresholds/${id}`,
        { method: 'DELETE' }
      );
    } catch {
      const s = getInitialStore();
      s.defect_thresholds = s.defect_thresholds.filter((r) => r.id !== id);
      saveStore(s);
      return { deleted: true, id };
    }
  },

  async getActivities(
    params: { search?: string; parent_activity_id?: string; date?: string } = {}
  ): Promise<Activity[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set('search', params.search);
      if (params.parent_activity_id)
        searchParams.set('parent_activity_id', params.parent_activity_id);
      if (params.date) searchParams.set('date', params.date);
      const qs = searchParams.toString();
      return await requestJson<Activity[]>(`/activities${qs ? `?${qs}` : ''}`);
    } catch {
      const s = getInitialStore();
      const q = (params.search || '').trim().toLowerCase();
      return s.activities
        .filter(
          (a) =>
            !params.parent_activity_id ||
            String(a.id) === String(params.parent_activity_id)
        )
        .map((a) => ({
          ...a,
          sub_activities: s.sub_activities.filter((sa) => sa.activity_id === a.id),
        }))
        .filter((a) => {
          if (!q) return true;
          const actMatches =
            a.name.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q);
          const subMatches = a.sub_activities.some(
            (sa) =>
              sa.name.toLowerCase().includes(q) ||
              sa.description.toLowerCase().includes(q)
          );
          return actMatches || subMatches;
        });
    }
  },

  async createActivity(payload: Partial<Activity>): Promise<Activity> {
    try {
      return await requestJson<Activity>('/activities', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const s = getInitialStore();
      const nextId = s.activities.reduce((m, a) => Math.max(m, a.id), 0) + 1;
      const created = {
        id: nextId,
        sub_division_id: payload.sub_division_id ?? 1,
        name: payload.name || 'New Activity',
        description: payload.description || 'Lorem Ipsum Lorem Ipsum',
        total_sub_activities_override: 14,
        scheduled_date: payload.scheduled_date || '1 Dec 2023',
        scheduled_time: payload.scheduled_time || '11:00PM',
      };
      s.activities.push(created);
      saveStore(s);
      return { ...created, sub_activities: [] };
    }
  },

  async createSubActivity(payload: Partial<SubActivity>): Promise<SubActivity> {
    try {
      return await requestJson<SubActivity>('/sub-activities', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const s = getInitialStore();
      const nextId = s.sub_activities.reduce((m, a) => Math.max(m, a.id), 0) + 1;
      const created: SubActivity = {
        id: nextId,
        activity_id: Number(payload.activity_id ?? 1),
        name: payload.name || 'New Sub Activity',
        description: payload.description || 'Lorem Ipsum Lorem Ipsum',
        insp_req_count: Number(payload.insp_req_count ?? 45),
        scheduled_date: payload.scheduled_date || '18 Nov 2023',
        scheduled_time: payload.scheduled_time || '11:00PM',
      };
      s.sub_activities.push(created);
      saveStore(s);
      return created;
    }
  },

  async updateSubActivity(
    id: number,
    payload: Partial<SubActivity>
  ): Promise<SubActivity> {
    try {
      return await requestJson<SubActivity>(`/sub-activities/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch {
      const s = getInitialStore();
      const idx = s.sub_activities.findIndex((sa) => sa.id === id);
      if (idx !== -1) {
        s.sub_activities[idx] = { ...s.sub_activities[idx], ...payload };
        saveStore(s);
        return s.sub_activities[idx];
      }
      throw new Error('Not found');
    }
  },

  async deleteSubActivity(id: number): Promise<{ deleted: boolean; id: number }> {
    try {
      return await requestJson<{ deleted: boolean; id: number }>(
        `/sub-activities/${id}`,
        { method: 'DELETE' }
      );
    } catch {
      const s = getInitialStore();
      s.sub_activities = s.sub_activities.filter((sa) => sa.id !== id);
      saveStore(s);
      return { deleted: true, id };
    }
  },

  async getInspectionRequests(subActivityId?: number): Promise<InspectionRequest[]> {
    try {
      const qs = subActivityId ? `?sub_activity_id=${subActivityId}` : '';
      return await requestJson<InspectionRequest[]>(`/inspection-requests${qs}`);
    } catch {
      const s = getInitialStore();
      return s.inspection_requests.filter(
        (ir) => !subActivityId || ir.sub_activity_id === subActivityId
      );
    }
  },

  async updateInspectionRequest(
    id: number,
    payload: Partial<InspectionRequest>
  ): Promise<InspectionRequest> {
    try {
      return await requestJson<InspectionRequest>(`/inspection-requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch {
      const s = getInitialStore();
      const idx = s.inspection_requests.findIndex((ir) => ir.id === id);
      if (idx !== -1) {
        s.inspection_requests[idx] = { ...s.inspection_requests[idx], ...payload };
        saveStore(s);
        return s.inspection_requests[idx];
      }
      throw new Error('Not found');
    }
  },

  async getForemen(): Promise<Foreman[]> {
    try {
      return await requestJson<Foreman[]>('/foremen');
    } catch {
      return getInitialStore().foremen;
    }
  },
};
