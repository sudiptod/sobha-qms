import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Layers,
  HardHat,
  Phone,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import {
  Foreman,
  HierarchyPayload,
  InspectionRequest,
  qmsApi,
} from '../services/api';
import { NavTab } from '../components/Sidebar';

interface SupportingViewProps {
  tab: NavTab;
  hierarchy: HierarchyPayload | null;
  onSelectTab: (tab: NavTab) => void;
  onRefreshHierarchy: () => void;
}

export const SupportingViews: React.FC<SupportingViewProps> = ({
  tab,
  hierarchy,
  onSelectTab,
  onRefreshHierarchy,
}) => {
  const [inspectionRequests, setInspectionRequests] = useState<InspectionRequest[]>([]);
  const [foremen, setForemen] = useState<Foreman[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (tab === 'inspection-requests' || tab === 'dashboard') {
      setLoading(true);
      qmsApi
        .getInspectionRequests()
        .then(setInspectionRequests)
        .finally(() => setLoading(false));
    }
    if (tab === 'foreman' || tab === 'dashboard') {
      qmsApi.getForemen().then(setForemen);
    }
  }, [tab]);

  const handleStatusChange = async (
    id: number,
    status: 'Pending' | 'In Review' | 'Approved' | 'Rejected'
  ) => {
    await qmsApi.updateInspectionRequest(id, { status });
    setInspectionRequests((prev) =>
      prev.map((ir) => (ir.id === id ? { ...ir, status } : ir))
    );
    onRefreshHierarchy();
  };

  if (tab === 'inspection-requests') {
    return (
      <div className="flex-1 min-h-screen bg-[#F4F5F7] px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[26px] font-semibold text-[#18181B]">
              Inspection Requests
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live field inspection queue linked to WBS Sub-Activities and Foremen
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-black text-white text-xs font-semibold px-3.5 py-2 rounded-xl">
              Pending Queue: +{hierarchy?.stats.pending_inspection_requests ?? 19}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-gray-100 px-8 py-6 shadow-2xs">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              Loading inspection requests...
            </div>
          ) : (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-gray-200 text-left font-semibold text-gray-800">
                  <th className="py-3.5 pr-4">IR Number</th>
                  <th className="py-3.5 px-3">Project</th>
                  <th className="py-3.5 px-3">Activity / Sub-Activity</th>
                  <th className="py-3.5 px-3">Unit Location</th>
                  <th className="py-3.5 px-3">Foreman</th>
                  <th className="py-3.5 px-3">Requested Date</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 pl-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {inspectionRequests.map((ir) => (
                  <tr key={ir.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3.5 pr-4 font-semibold text-gray-900">
                      {ir.ir_number}
                    </td>
                    <td className="py-3.5 px-3">{ir.project_name}</td>
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-gray-800">{ir.activity_name}</div>
                      <div className="text-[11px] text-gray-400">{ir.sub_activity_name}</div>
                    </td>
                    <td className="py-3.5 px-3">{ir.location_unit}</td>
                    <td className="py-3.5 px-3">{ir.foreman_name}</td>
                    <td className="py-3.5 px-3 text-xs">{ir.requested_date}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          ir.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : ir.status === 'Rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {ir.status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-3 text-center">
                      <select
                        value={ir.status}
                        onChange={(e) =>
                          handleStatusChange(
                            ir.id,
                            e.target.value as InspectionRequest['status']
                          )
                        }
                        className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs bg-white cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Review">In Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  if (tab === 'foreman') {
    return (
      <div className="flex-1 min-h-screen bg-[#F4F5F7] px-8 py-6">
        <h1 className="text-[26px] font-semibold text-[#18181B] mb-6">
          Field Foremen Directory
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {foremen.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs"
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#1B1B1B] text-[#C5A06E] flex items-center justify-center">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{f.name}</h3>
                  <span className="text-xs text-gray-400">
                    {f.employee_code} • {f.role}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Trade Specialization:</span>
                  <span className="font-medium text-gray-800">{f.trade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Assigned Project:</span>
                  <span className="font-medium text-gray-800">{f.project_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Contact:</span>
                  <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                    <Phone className="w-3 h-3" /> {f.phone}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-400">Active IRs:</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                    {f.active_inspections} Requests
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'projects' || tab === 'divisions') {
    return (
      <div className="flex-1 min-h-screen bg-[#F4F5F7] px-8 py-6">
        <h1 className="text-[26px] font-semibold text-[#18181B] mb-6">
          {tab === 'projects' ? 'Projects Master' : 'Divisions & Sub-Divisions'}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {(hierarchy?.projects || []).map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#1B1B1B] text-[#C5A06E]">
                  {p.code}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  {p.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{p.location}</p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                <span className="text-gray-400">
                  Divisions:{' '}
                  {
                    (hierarchy?.divisions || []).filter((d) => d.project_id === p.id)
                      .length
                  }
                </span>
                <button
                  onClick={() => onSelectTab('defect-logging')}
                  className="text-black font-medium inline-flex items-center gap-1 hover:underline cursor-pointer"
                >
                  View Thresholds <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#B89768]" /> WBS Divisions &amp; Sub-Divisions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(hierarchy?.divisions || []).map((div) => (
              <div key={div.id} className="border border-gray-200 rounded-xl p-4">
                <div className="font-semibold text-sm text-gray-900">{div.name}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(hierarchy?.sub_divisions || [])
                    .filter((sd) => sd.division_id === div.id)
                    .map((sd) => (
                      <span
                        key={sd.id}
                        className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg"
                      >
                        {sd.name}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default: Executive Dashboard / Admin Config / Settings
  return (
    <div className="flex-1 min-h-screen bg-[#F4F5F7] px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-semibold text-[#18181B]">
            {tab === 'admin-config'
              ? 'Admin Quality Configuration'
              : tab === 'settings'
              ? 'System Settings'
              : 'SOBHA Quality Governance Dashboard'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Unified Construction Quality &amp; Defect Threshold Management Overview
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <div
          onClick={() => onSelectTab('defect-logging')}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs cursor-pointer hover:border-[#B89768] transition"
        >
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>MAPPED DEFECT RULES</span>
            <ShieldCheck className="w-4 h-4 text-[#B89768]" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {hierarchy?.stats.total_defect_rules ?? 9}
          </div>
          <div className="text-[11px] text-[#B89768] mt-1 font-medium">
            Open Screen 1: Defect Threshold Mapping →
          </div>
        </div>

        <div
          onClick={() => onSelectTab('activities')}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs cursor-pointer hover:border-black transition"
        >
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>WBS PARENT ACTIVITIES</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {hierarchy?.stats.total_activities ?? 4}
          </div>
          <div className="text-[11px] text-gray-600 mt-1 font-medium">
            Open Screen 2: All Activities Accordion →
          </div>
        </div>

        <div
          onClick={() => onSelectTab('inspection-requests')}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs cursor-pointer hover:border-black transition"
        >
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>PENDING INSP. REQUESTS</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            +{hierarchy?.stats.pending_inspection_requests ?? 19}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Requires QA/QC Inspector sign-off
          </div>
        </div>

        <div
          onClick={() => onSelectTab('projects')}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs cursor-pointer hover:border-black transition"
        >
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>ACTIVE DEVELOPMENTS</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {hierarchy?.stats.total_projects ?? 3}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Sobha Hartland II, Sobha One, SeaHaven
          </div>
        </div>
      </div>

      {/* Quick Jump Cards to Screen 1 and Screen 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1B1B1B] text-white rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#C5A06E] font-semibold">
              Reference Screen 1
            </span>
            <h3 className="text-xl font-semibold mt-1">Defect Threshold Mapping</h3>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              Configure statistical quality thresholds (Defect, Sporadic, Chronic) and FMEA
              Severity &amp; Control indices across Projects, Divisions, Sub-Divisions,
              Activities, and Sub-Activities.
            </p>
          </div>
          <div className="mt-5">
            <button
              onClick={() => onSelectTab('defect-logging')}
              className="bg-[#B89768] hover:bg-[#a68557] text-white text-xs font-semibold px-4 py-2.5 rounded-xl inline-flex items-center gap-2 transition cursor-pointer"
            >
              <span>Launch Defect Threshold Mapping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white text-gray-900 rounded-2xl p-6 border border-gray-200 flex flex-col justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
              Reference Screen 2
            </span>
            <h3 className="text-xl font-semibold mt-1">
              All Activities &amp; Sub-Activities
            </h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Manage parent construction activities (Site Preparation, Foundation
              Construction, Framing, Enclosure) and expand nested Sub-Activities with live
              Inspection Request counts.
            </p>
          </div>
          <div className="mt-5">
            <button
              onClick={() => onSelectTab('activities')}
              className="bg-black hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl inline-flex items-center gap-2 transition cursor-pointer"
            >
              <span>Launch All Activities View</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
