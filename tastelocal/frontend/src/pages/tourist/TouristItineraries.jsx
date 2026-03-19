import { useEffect, useMemo, useState } from 'react';
import { itineraryAPI, bookingAPI } from '../../utils/api';
import { LoadingSpinner, EmptyState } from '../../components/UI';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiShare2, FiCalendar, FiClock, FiEdit2, FiX } from 'react-icons/fi';
import { resolveMediaUrl, getExperienceFallback } from '../../utils/media';

const initialItineraryForm = {
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  is_public: true,
};

const initialItemForm = {
  experience_id: '',
  day_number: 1,
  order: 1,
  planned_time: '',
  notes: '',
};

export default function TouristItineraries() {
  const [itineraries, setItineraries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState(null);
  const [itineraryForm, setItineraryForm] = useState(initialItineraryForm);

  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemForm, setItemForm] = useState(initialItemForm);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itinRes, bookingRes] = await Promise.all([
        itineraryAPI.list(),
        bookingAPI.myBookings(),
      ]);

      setItineraries(itinRes.data.results || itinRes.data || []);
      setBookings(bookingRes.data.results || bookingRes.data || []);
    } catch {
      setItineraries([]);
      setBookings([]);
      toast.error('Failed to load itineraries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const plannedExperienceIds = useMemo(() => {
    const ids = new Set();
    itineraries.forEach((itin) => {
      (itin.items || []).forEach((item) => {
        if (item?.experience?.id) ids.add(item.experience.id);
      });
    });
    return ids;
  }, [itineraries]);

  const availableExperiences = useMemo(() => {
    const map = new Map();

    bookings
      .filter((b) => ['confirmed', 'completed'].includes(b.status))
      .forEach((b) => {
        if (b.experience?.id) {
          map.set(b.experience.id, {
            ...b.experience,
            booking_date: b.booking_date,
            booking_time: b.booking_time,
          });
        }
      });

    return Array.from(map.values());
  }, [bookings]);

  const openCreateModal = () => {
    setEditingItinerary(null);
    setItineraryForm(initialItineraryForm);
    setShowCreate(true);
  };

  const openEditModal = (itinerary) => {
    setEditingItinerary(itinerary);
    setItineraryForm({
      title: itinerary.title || '',
      description: itinerary.description || '',
      start_date: itinerary.start_date || '',
      end_date: itinerary.end_date || '',
      is_public: itinerary.is_public ?? true,
    });
    setShowCreate(true);
  };

  const closeCreateModal = () => {
    setShowCreate(false);
    setEditingItinerary(null);
    setItineraryForm(initialItineraryForm);
  };

  const handleSaveItinerary = async (e) => {
    e.preventDefault();

    if (
      itineraryForm.start_date &&
      itineraryForm.end_date &&
      itineraryForm.end_date < itineraryForm.start_date
    ) {
      toast.error('End date cannot be earlier than start date.');
      return;
    }

    setSaving(true);
    try {
      if (editingItinerary) {
        const payload = {
          title: itineraryForm.title,
          description: itineraryForm.description,
          start_date: itineraryForm.start_date || null,
          end_date: itineraryForm.end_date || null,
          is_public: itineraryForm.is_public,
          items: (editingItinerary.items || []).map((item) => ({
            experience_id: item.experience?.id,
            day_number: item.day_number || 1,
            order: item.order || 0,
            planned_time: item.planned_time || null,
            notes: item.notes || '',
          })),
        };

        const res = await itineraryAPI.update(editingItinerary.id, payload);
        setItineraries((prev) =>
          prev.map((itin) => (itin.id === editingItinerary.id ? res.data : itin))
        );
        toast.success('Itinerary updated.');
      } else {
        const payload = {
          title: itineraryForm.title,
          description: itineraryForm.description,
          start_date: itineraryForm.start_date || null,
          end_date: itineraryForm.end_date || null,
          is_public: itineraryForm.is_public,
          items: [],
        };

        const res = await itineraryAPI.create(payload);
        setItineraries((prev) => [res.data, ...prev]);
        toast.success('Itinerary created.');
      }

      closeCreateModal();
    } catch {
      toast.error('Failed to save itinerary.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItinerary = async (id) => {
    if (!window.confirm('Delete this itinerary?')) return;

    try {
      await itineraryAPI.delete(id);
      setItineraries((prev) => prev.filter((itin) => itin.id !== id));
      toast.success('Itinerary deleted.');
    } catch {
      toast.error('Failed to delete itinerary.');
    }
  };

  const openAddItemModal = (itinerary) => {
    setSelectedItinerary(itinerary);
    setItemForm(initialItemForm);
    setShowAddItem(true);
  };

  const closeAddItemModal = () => {
    setSelectedItinerary(null);
    setShowAddItem(false);
    setItemForm(initialItemForm);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!itemForm.experience_id) {
      toast.error('Please choose an experience.');
      return;
    }

    try {
      const res = await itineraryAPI.addItem(selectedItinerary.id, {
        experience_id: Number(itemForm.experience_id),
        day_number: Number(itemForm.day_number || 1),
        order: Number(itemForm.order || 1),
        planned_time: itemForm.planned_time || null,
        notes: itemForm.notes || '',
      });

      const chosenExperience = availableExperiences.find(
        (exp) => Number(exp.id) === Number(itemForm.experience_id)
      );

      setItineraries((prev) =>
        prev.map((itin) =>
          itin.id === selectedItinerary.id
            ? {
                ...itin,
                items: [
                  ...(itin.items || []),
                  {
                    ...res.data,
                    experience: chosenExperience || res.data.experience,
                  },
                ].sort((a, b) => {
                  if ((a.day_number || 1) !== (b.day_number || 1)) {
                    return (a.day_number || 1) - (b.day_number || 1);
                  }
                  return (a.order || 0) - (b.order || 0);
                }),
              }
            : itin
        )
      );

      toast.success('Experience added to itinerary.');
      closeAddItemModal();
    } catch {
      toast.error('Failed to add experience to itinerary.');
    }
  };

  const handleRemoveItem = async (itineraryId, itemId) => {
    if (!window.confirm('Remove this experience from the itinerary?')) return;

    try {
      await itineraryAPI.removeItem(itemId);
      setItineraries((prev) =>
        prev.map((itin) =>
          itin.id === itineraryId
            ? { ...itin, items: (itin.items || []).filter((item) => item.id !== itemId) }
            : itin
        )
      );
      toast.success('Experience removed from itinerary.');
    } catch {
      toast.error('Failed to remove item.');
    }
  };

  const copyShareLink = (shareUuid) => {
    navigator.clipboard.writeText(`${window.location.origin}/itinerary/${shareUuid}`);
    toast.success('Share link copied!');
  };

  const formatDateRange = (start, end) => {
    if (!start && !end) return 'No travel dates set';
    if (start && end) {
      return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
    }
    return start
      ? `Starts ${new Date(start).toLocaleDateString()}`
      : `Ends ${new Date(end).toLocaleDateString()}`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">My Itineraries</h1>
          <p className="text-gray-500 mt-1">
            Plan your food trip with dates, day numbers, times, and booked experiences.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus />
          New Itinerary
        </button>
      </div>

      {itineraries.length === 0 ? (
        <EmptyState
          icon="🗺️"
          title="No itineraries yet"
          description="Create your first itinerary and start adding booked food experiences into a day-by-day schedule."
        />
      ) : (
        <div className="space-y-5">
          {itineraries.map((itin) => (
            <div
              key={itin.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl font-semibold">{itin.title}</h3>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        itin.is_public
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {itin.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>

                  {itin.description && (
                    <p className="text-sm text-gray-500 mt-2">{itin.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <FiCalendar />
                      {formatDateRange(itin.start_date, itin.end_date)}
                    </span>
                    <span>{itin.items?.length || 0} planned experience(s)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openAddItemModal(itin)}
                    className="btn-secondary text-sm"
                  >
                    Add Experience
                  </button>

                  <button
                    onClick={() => openEditModal(itin)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                    title="Edit itinerary"
                  >
                    <FiEdit2 />
                  </button>

                  {itin.is_public && (
                    <button
                      onClick={() => copyShareLink(itin.share_uuid)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                      title="Copy share link"
                    >
                      <FiShare2 />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteItinerary(itin.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                    title="Delete itinerary"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {itin.items?.length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                  {itin.items.map((item, idx) => {
                    const imageUrl =
                      resolveMediaUrl(item.experience?.image) ||
                      getExperienceFallback(item.experience || {});
                    return (
                      <div
                        key={item.id || idx}
                        className="flex flex-col md:flex-row md:items-center gap-4 rounded-xl border border-gray-100 p-3"
                      >
                        <img
                          src={imageUrl}
                          alt={item.experience?.title || 'Experience'}
                          className="w-full md:w-28 h-24 object-cover rounded-xl"
                        />

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 font-medium">
                              Day {item.day_number || 1}
                            </span>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                              Stop {item.order || idx + 1}
                            </span>
                            {item.planned_time && (
                              <span className="text-xs px-2.5 py-1 rounded-full bg-accent-100 text-accent-700 font-medium flex items-center gap-1">
                                <FiClock size={12} />
                                {item.planned_time}
                              </span>
                            )}
                          </div>

                          <p className="font-semibold text-gray-900 mt-2">
                            {item.experience?.title || 'Experience'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.experience?.vendor_name || item.experience?.vendor?.business_name}
                          </p>

                          {item.notes && (
                            <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveItem(itin.id, item.id)}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItinerary ? 'Edit Itinerary' : 'Create New Itinerary'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Add travel dates and sharing settings for your food plan.
                </p>
              </div>
              <button
                onClick={closeCreateModal}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveItinerary} className="space-y-4">
              <div>
                <label className="label">Itinerary Title *</label>
                <input
                  type="text"
                  required
                  value={itineraryForm.title}
                  onChange={(e) =>
                    setItineraryForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="input-field"
                  placeholder="e.g. 3D2N Singapore Food Adventure"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  rows={3}
                  value={itineraryForm.description}
                  onChange={(e) =>
                    setItineraryForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Add notes about your trip or dining goals"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    value={itineraryForm.start_date}
                    onChange={(e) =>
                      setItineraryForm((prev) => ({ ...prev, start_date: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">End Date</label>
                  <input
                    type="date"
                    value={itineraryForm.end_date}
                    onChange={(e) =>
                      setItineraryForm((prev) => ({ ...prev, end_date: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={itineraryForm.is_public}
                  onChange={(e) =>
                    setItineraryForm((prev) => ({ ...prev, is_public: e.target.checked }))
                  }
                />
                Make itinerary shareable
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingItinerary ? 'Update Itinerary' : 'Create Itinerary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddItem && selectedItinerary && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Experience to Itinerary</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedItinerary.title}</p>
              </div>
              <button
                onClick={closeAddItemModal}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="label">Booked Experience *</label>
                <select
                  value={itemForm.experience_id}
                  onChange={(e) =>
                    setItemForm((prev) => ({ ...prev, experience_id: e.target.value }))
                  }
                  className="input-field"
                  required
                >
                  <option value="">Select a confirmed/completed booking</option>
                  {availableExperiences.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.title} — {exp.vendor_name}
                      {plannedExperienceIds.has(exp.id) ? ' (already used in an itinerary)' : ''}
                    </option>
                  ))}
                </select>
                {availableExperiences.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    You need a confirmed or completed booking first before adding it to the itinerary.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Day Number</label>
                  <input
                    type="number"
                    min="1"
                    value={itemForm.day_number}
                    onChange={(e) =>
                      setItemForm((prev) => ({ ...prev, day_number: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Order / Stop</label>
                  <input
                    type="number"
                    min="1"
                    value={itemForm.order}
                    onChange={(e) =>
                      setItemForm((prev) => ({ ...prev, order: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Planned Time</label>
                  <input
                    type="time"
                    value={itemForm.planned_time}
                    onChange={(e) =>
                      setItemForm((prev) => ({ ...prev, planned_time: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  rows={3}
                  value={itemForm.notes}
                  onChange={(e) =>
                    setItemForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Meeting point reminders, what to eat first, transport notes, etc."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeAddItemModal} className="btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={availableExperiences.length === 0}
                >
                  Add to Itinerary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}