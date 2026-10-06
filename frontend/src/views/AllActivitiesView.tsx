import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  Plus,
  Pencil,
  Eye,
  X,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import { Activity, SubActivity, qmsApi } from '../services/api';

interface AllActivitiesViewProps {
  onNavigateToThresholds: (activityId: number, subActivityId: number) => void;
  onRefreshHierarchy: () => void;
}

export const AllActivitiesView: React.FC<AllActivitiesViewProps> = ({
  onNavigateToThresholds,
  onRefreshHierarchy,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('1 Dec 2023');

  // Expanded accordion IDs: default "Site Preparation" (id=1) expanded to match Screenshot 2
  const [expandedIds, setExpandedIds] = useState<number[]>([1]);

  // Inline Sub-Activity edit state
  const [editingSubId, setEditingSubId] = useState<number | null>(null);
  const [subEditForm, setSubEditForm] = useState<Partial<SubActivity>>({});

  // View Sub-Activity Detail Modal
  const [viewingSub, setViewingSub] = useState<{
    parent: Activity;
    sub: SubActivity;
  } | null>(null);

  // Add New Activity / Sub-Activity Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [createMode, setCreateMode] = useState<'parent' | 'sub'>('parent');
  const [newActivityForm, setNewActivityForm] = useState({
    name: '',
    description: 'Lorem Ipsum Lorem Ipsum',
    scheduled_date: '1 Dec 2023',
    scheduled_time: '11:00PM',
    parent_activity_id: 1,
    insp_req_count: 45,
  });

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await qmsApi.getActivities({
        search: searchQuery.trim() || undefined,
        parent_activity_id: selectedParentId || undefined,
      });
      setActivities(data);
    } catch (e) {
      console.error('Failed to fetch activities:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [searchQuery, selectedParentId]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const startEditSub = (sub: SubActivity) => {
    setEditingSubId(sub.id);
    setSubEditForm({
      name: sub.name,
      description: sub.description,
      insp_req_count: sub.insp_req_count,
      scheduled_date: sub.scheduled_date,
      scheduled_time: sub.scheduled_time,
    });
  };

  const saveEditSub = async (subId: number) => {
    try {
      const updated = await qmsApi.updateSubActivity(subId, subEditForm);
      setActivities((prev) =>
        prev.map((act) => ({
          ...act,
          sub_activities: act.sub_activities.map((s) =>
            s.id === subId ? { ...s, ...updated } : s
          ),
        }))
      );
      setEditingSubId(null);
      showToast(`Updated sub-activity "${updated.name}"`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityForm.name.trim()) return;

    try {
      if (createMode === 'parent') {
        const created = await qmsApi.createActivity({
          name: newActivityForm.name,
          description: newActivityForm.description,
          scheduled_date: newActivityForm.scheduled_date,
          scheduled_time: newActivityForm.scheduled_time,
        });
        setActivities((prev) => [...prev, created]);
        showToast(`Created parent activity "${created.name}"`);
      } else {
        const createdSub = await qmsApi.createSubActivity({
          activity_id: Number(newActivityForm.parent_activity_id),
          name: newActivityForm.name,
          description: newActivityForm.description,
          insp_req_count: Number(newActivityForm.insp_req_count),
          scheduled_date: newActivityForm.scheduled_date,
          scheduled_time: newActivityForm.scheduled_time,
        });
        setActivities((prev) =>
          prev.map((a) =>
            a.id === Number(newActivityForm.parent_activity_id)
              ? { ...a, sub_activities: [...a.sub_activities, createdSub] }
              : a
          )
        );
        if (!expandedIds.includes(Number(newActivityForm.parent_activity_id))) {
          setExpandedIds((prev) => [...prev, Number(newActivityForm.parent_activity_id)]);
        }
        showToast(`Added sub-activity "${createdSub.name}"`);
      }
      setShowAddModal(false);
      setNewActivityForm({ ...newActivityForm, name: '' });
      onRefreshHierarchy();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#F4F5F7] px-8 py-6">
      {toast && (
        <div className="fixed bottom-5 right-6 z-50 bg-black text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      {/* Top Header (Exact match to Screenshot 2: "All Activities", Search, Profile Circle) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-[26px] font-semibold text-[#18181B] tracking-tight">
          All Activities
        </h1>

        <div className="flex items-center gap-4">
          <div className="relative w-[320px]">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl text-[13.5px] text-gray-800 placeholder-gray-400 border border-gray-100 shadow-2xs focus:outline-none focus:border-gray-300"
            />
          </div>

          {/* Profile Avatar Circle on Top Right */}
          <div
            className="w-10 h-10 rounded-full bg-[#C4C4C4] shrink-0 cursor-pointer hover:ring-2 hover:ring-gray-400 transition"
            title="QA/QC Inspector Profile"
          />
        </div>
      </div>

      {/* Main White Card Container (Exact match to Screenshot 2) */}
      <div className="bg-white rounded-[20px] shadow-2xs border border-gray-100/80 px-8 py-7 min-h-[620px]">
        {/* Filter By & "+ Add New Activity" Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-7">
          <div className="flex flex-wrap items-center gap-3.5">
            <span className="text-[15px] font-semibold text-[#18181B] mr-1">
              Filter By
            </span>

            {/* Parent Activity Dropdown */}
            <div className="relative">
              <select
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-9 py-2.5 text-[13px] text-gray-700 font-normal hover:border-gray-300 focus:outline-none cursor-pointer min-w-[142px]"
              >
                <option value="">Parent Activity</option>
                {activities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-700 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Date Picker Button ("1 Dec 2023" with Calendar icon) */}
            <div className="relative flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-700 gap-2.5 hover:border-gray-300 cursor-pointer">
              <input
                type="text"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-[82px] bg-transparent focus:outline-none text-[13px] text-gray-700 cursor-pointer"
                aria-label="Filter Date"
              />
              <Calendar className="w-4 h-4 text-gray-600 shrink-0" />
            </div>
          </div>

          {/* Primary CTA: "+ Add New Activity" */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-black hover:bg-neutral-800 text-white text-[13px] font-medium px-5 py-3 rounded-xl inline-flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            <span>Add New Activity</span>
          </button>
        </div>

        {/* Parent Activities Accordion Table */}
        <div className="w-full">
          {/* Table Header */}
          <div className="grid grid-cols-12 items-center border-b border-gray-100 pb-3.5 px-2 text-[12.5px] font-semibold text-[#18181B]">
            <div className="col-span-3">Activity</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-2 text-center">Total Sub Activities</div>
            <div className="col-span-2">Date &amp; Time</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              Loading activities...
            </div>
          ) : activities.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No activities found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activities.map((act) => {
                const isExpanded = expandedIds.includes(act.id);
                const subCount =
                  act.total_sub_activities_override ?? act.sub_activities?.length ?? 14;

                return (
                  <div key={act.id} className="py-1">
                    {/* Parent Row */}
                    <div
                      onClick={() => toggleExpand(act.id)}
                      className={`grid grid-cols-12 items-center py-4 px-2 text-[13px] cursor-pointer rounded-lg hover:bg-gray-50/80 transition ${
                        isExpanded
                          ? 'font-semibold text-[#18181B]'
                          : 'font-normal text-gray-500'
                      }`}
                    >
                      <div className="col-span-3 pr-3">{act.name}</div>
                      <div className="col-span-4 pr-3">{act.description}</div>
                      <div className="col-span-2 text-center">{subCount}</div>
                      <div className="col-span-2">
                        {act.scheduled_date} <span className="mx-1">|</span> {act.scheduled_time}
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(act.id);
                          }}
                          className="p-1 rounded-md hover:bg-gray-200/60 text-gray-800 transition cursor-pointer"
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 stroke-[2.2]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 stroke-[2.2]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Nested Sub-Activity Table (Exact rounded bordered box from Screenshot 2) */}
                    {isExpanded && (
                      <div className="my-2 border border-gray-400/90 rounded-[16px] px-6 py-4 bg-white">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-gray-100 text-[12px] font-semibold text-[#18181B]">
                              <th className="text-left py-2.5 pr-4 w-[26%]">Sub Activity</th>
                              <th className="text-left py-2.5 px-3 w-[32%]">Description</th>
                              <th className="text-left py-2.5 px-3 w-[16%]">Insp. Req. Count</th>
                              <th className="text-left py-2.5 px-3 w-[16%]">Date</th>
                              <th className="text-center py-2.5 pl-3 w-[10%]">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-[13px] text-gray-500">
                            {(act.sub_activities || []).length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-5 text-center text-gray-400 text-xs">
                                  No sub-activities added yet.
                                </td>
                              </tr>
                            ) : (
                              act.sub_activities.map((sub) => {
                                const isSubEditing = editingSubId === sub.id;

                                return (
                                  <tr key={sub.id} className="hover:bg-gray-50/50 transition">
                                    <td className="py-4 pr-4">
                                      {isSubEditing ? (
                                        <input
                                          type="text"
                                          value={subEditForm.name ?? sub.name}
                                          onChange={(e) =>
                                            setSubEditForm({
                                              ...subEditForm,
                                              name: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-2.5 py-1 text-[13px] text-gray-900"
                                        />
                                      ) : (
                                        sub.name
                                      )}
                                    </td>
                                    <td className="py-4 px-3">
                                      {isSubEditing ? (
                                        <input
                                          type="text"
                                          value={subEditForm.description ?? sub.description}
                                          onChange={(e) =>
                                            setSubEditForm({
                                              ...subEditForm,
                                              description: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-2.5 py-1 text-[13px] text-gray-900"
                                        />
                                      ) : (
                                        sub.description
                                      )}
                                    </td>
                                    <td className="py-4 px-3">
                                      {isSubEditing ? (
                                        <input
                                          type="number"
                                          value={subEditForm.insp_req_count ?? sub.insp_req_count}
                                          onChange={(e) =>
                                            setSubEditForm({
                                              ...subEditForm,
                                              insp_req_count: Number(e.target.value),
                                            })
                                          }
                                          className="w-20 border border-gray-300 rounded-lg px-2.5 py-1 text-[13px] text-gray-900"
                                        />
                                      ) : (
                                        sub.insp_req_count
                                      )}
                                    </td>
                                    <td className="py-4 px-3">
                                      {sub.scheduled_date} <span className="mx-0.5">|</span>{' '}
                                      {sub.scheduled_time}
                                    </td>
                                    <td className="py-4 pl-3 text-center">
                                      {isSubEditing ? (
                                        <div className="inline-flex items-center gap-2">
                                          <button
                                            onClick={() => saveEditSub(sub.id)}
                                            className="p-1.5 rounded-lg bg-black text-white hover:bg-neutral-800 cursor-pointer"
                                            title="Save"
                                          >
                                            <Check className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => setEditingSubId(null)}
                                            className="p-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                                            title="Cancel"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="inline-flex items-center justify-center gap-3.5 text-gray-800">
                                          <button
                                            onClick={() => startEditSub(sub)}
                                            className="hover:text-black transition cursor-pointer"
                                            title="Edit Sub Activity"
                                          >
                                            <Pencil className="w-[16px] h-[16px] stroke-[1.8]" />
                                          </button>
                                          <span className="h-4 w-[1px] bg-gray-200" />
                                          <button
                                            onClick={() =>
                                              setViewingSub({ parent: act, sub })
                                            }
                                            className="hover:text-black transition cursor-pointer"
                                            title="View Sub Activity & Thresholds"
                                          >
                                            <Eye className="w-[17px] h-[17px] stroke-[1.8]" />
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sub-Activity View Details Modal (Bridges Screen 2 -> Screen 1) */}
      {viewingSub && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B89768]">
                  {viewingSub.parent.name}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {viewingSub.sub.name}
                </h3>
              </div>
              <button
                onClick={() => setViewingSub(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-sm text-gray-600">
              <p>{viewingSub.sub.description}</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="text-xs text-gray-400">Inspection Requests</div>
                  <div className="text-xl font-bold text-gray-900 mt-0.5">
                    {viewingSub.sub.insp_req_count}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="text-xs text-gray-400">Scheduled Date</div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {viewingSub.sub.scheduled_date}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => setViewingSub(null)}
                className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const actId = viewingSub.parent.id;
                  const subId = viewingSub.sub.id;
                  setViewingSub(null);
                  onNavigateToThresholds(actId, subId);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-medium bg-black text-white hover:bg-neutral-800 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Configure Defect Thresholds</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "+ Add New Activity" Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Add New Activity</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl mt-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setCreateMode('parent')}
                className={`py-2 rounded-lg transition cursor-pointer ${
                  createMode === 'parent' ? 'bg-black text-white' : 'text-gray-600'
                }`}
              >
                Parent Activity
              </button>
              <button
                type="button"
                onClick={() => setCreateMode('sub')}
                className={`py-2 rounded-lg transition cursor-pointer ${
                  createMode === 'sub' ? 'bg-black text-white' : 'text-gray-600'
                }`}
              >
                Sub-Activity
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              {createMode === 'sub' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Parent Activity
                  </label>
                  <select
                    value={newActivityForm.parent_activity_id}
                    onChange={(e) =>
                      setNewActivityForm({
                        ...newActivityForm,
                        parent_activity_id: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  >
                    {activities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {createMode === 'parent' ? 'Activity Name *' : 'Sub-Activity Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    createMode === 'parent'
                      ? 'e.g., MEP First Fix'
                      : 'e.g., Chilled Water Pressure Test'
                  }
                  value={newActivityForm.name}
                  onChange={(e) =>
                    setNewActivityForm({ ...newActivityForm, name: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newActivityForm.description}
                  onChange={(e) =>
                    setNewActivityForm({ ...newActivityForm, description: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>

              {createMode === 'sub' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Inspection Request Count
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newActivityForm.insp_req_count}
                    onChange={(e) =>
                      setNewActivityForm({
                        ...newActivityForm,
                        insp_req_count: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-black text-white hover:bg-neutral-800 cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
