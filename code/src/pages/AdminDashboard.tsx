import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users,
  Building2,
  CalendarCheck,
  Plus,
  Edit2,
  Trash2,
  Power,
  Shield,
  Layers,
  Sparkles,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { storageService, subscribeToStorageChanges } from '../services/storageService';
import { CampusRoom, Society, CampusLocationCode, RoomStatus } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const AdminDashboard: React.FC = () => {
  const [rooms, setRooms] = useState<CampusRoom[]>(() => storageService.getRooms());
  const [societies, setSocieties] = useState<Society[]>(() => storageService.getSocieties());
  const [locations] = useState(() => storageService.getLocations());
  const [bookings, setBookings] = useState(() => storageService.getBookings());

  const { pathname } = useLocation();
  const tabForPath = (path: string): 'rooms' | 'societies' | 'overview' => path === '/admin/rooms' ? 'rooms' : path === '/admin/societies' ? 'societies' : 'overview';
  const [activeTab, setActiveTab] = useState<'rooms' | 'societies' | 'overview'>(() => tabForPath(pathname));
  useEffect(() => setActiveTab(tabForPath(pathname)), [pathname]);

  // Room modal state
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<CampusRoom | null>(null);
  const [roomName, setRoomName] = useState('');
  const [roomLocationId, setRoomLocationId] = useState<CampusLocationCode>('B Block');
  const [roomCapacity, setRoomCapacity] = useState(80);
  const [roomType, setRoomType] = useState<CampusRoom['type']>('Classroom');
  const [roomFacilities, setRoomFacilities] = useState('Projector, AC, Sound System');

  // Society modal state
  const [showSocietyModal, setShowSocietyModal] = useState(false);
  const [editingSociety, setEditingSociety] = useState<Society | null>(null);
  const [socName, setSocName] = useState('');
  const [socCode, setSocCode] = useState('');
  const [socCategory, setSocCategory] = useState<Society['category']>('Technical');
  const [socLead, setSocLead] = useState('');
  const [socLeadEmail, setSocLeadEmail] = useState('');
  const [socMembers, setSocMembers] = useState(150);

  useEffect(() => {
    const unsubscribe = subscribeToStorageChanges(() => {
      setRooms(storageService.getRooms());
      setSocieties(storageService.getSocieties());
      setBookings(storageService.getBookings());
    });
    return () => unsubscribe();
  }, []);

  // Room actions
  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setRoomName('');
    setRoomLocationId('B Block');
    setRoomCapacity(80);
    setRoomType('Classroom');
    setRoomFacilities('Projector, AC, Whiteboard');
    setShowRoomModal(true);
  };

  const handleOpenEditRoom = (r: CampusRoom) => {
    setEditingRoom(r);
    setRoomName(r.name);
    setRoomLocationId(r.locationId);
    setRoomCapacity(r.capacity);
    setRoomType(r.type);
    setRoomFacilities(r.facilities.join(', '));
    setShowRoomModal(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const facilitiesArray = roomFacilities
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    if (editingRoom) {
      const updated: CampusRoom = {
        ...editingRoom,
        name: roomName,
        locationId: roomLocationId,
        capacity: roomCapacity,
        type: roomType,
        facilities: facilitiesArray,
      };
      storageService.updateRoom(updated);
    } else {
      const newRoom: CampusRoom = {
        id: `${roomLocationId}-${Date.now().toString().slice(-3)}`,
        name: roomName,
        locationId: roomLocationId,
        capacity: roomCapacity,
        type: roomType,
        facilities: facilitiesArray,
        status: 'Available',
      };
      storageService.addRoom(newRoom);
    }
    setShowRoomModal(false);
  };

  const handleToggleRoomStatus = (room: CampusRoom) => {
    const newStatus: RoomStatus = room.status === 'Unavailable' ? 'Available' : 'Unavailable';
    storageService.updateRoom({ ...room, status: newStatus });
  };

  // Society actions
  const handleOpenAddSociety = () => {
    setEditingSociety(null);
    setSocName('');
    setSocCode('');
    setSocCategory('Technical');
    setSocLead('');
    setSocLeadEmail('');
    setSocMembers(100);
    setShowSocietyModal(true);
  };

  const handleOpenEditSociety = (s: Society) => {
    setEditingSociety(s);
    setSocName(s.name);
    setSocCode(s.code);
    setSocCategory(s.category);
    setSocLead(s.leadName);
    setSocLeadEmail(s.leadEmail);
    setSocMembers(s.memberCount);
    setShowSocietyModal(true);
  };

  const handleSaveSociety = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSociety) {
      const updated: Society = {
        ...editingSociety,
        name: socName,
        code: socCode.toUpperCase(),
        category: socCategory,
        leadName: socLead,
        leadEmail: socLeadEmail,
        memberCount: socMembers,
      };
      storageService.updateSociety(updated);
    } else {
      const newSoc: Society = {
        id: `soc-${socCode.toLowerCase()}-${Date.now().toString().slice(-3)}`,
        name: socName,
        code: socCode.toUpperCase(),
        category: socCategory,
        leadName: socLead,
        leadEmail: socLeadEmail,
        memberCount: socMembers,
        description: 'Active campus society.',
      };
      storageService.addSociety(newSoc);
    }
    setShowSocietyModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Campus, in order.
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
              Admin Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage rooms, societies, and the spaces that bring them together.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'rooms' && (
            <button
              type="button"
              onClick={handleOpenAddRoom}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Campus Room
            </button>
          )}
          {activeTab === 'societies' && (
            <button
              type="button"
              onClick={handleOpenAddSociety}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              Register Society
            </button>
          )}
        </div>
      </div>

      {/* Admin Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <MetricCard
          title="Total Users"
          value="1,420+"
          subtitle="Students & faculty"
          icon={<Users className="h-5 w-5" />}
          colorScheme="blue"
        />
        <MetricCard
          title="Total Societies"
          value={societies.length}
          subtitle="Registered chapters"
          icon={<Shield className="h-5 w-5" />}
          colorScheme="indigo"
        />
        <MetricCard
          title="Locations"
          value={locations.length}
          subtitle="12 designated zones"
          icon={<MapPin className="h-5 w-5" />}
          colorScheme="amber"
        />
        <MetricCard
          title="Total Rooms"
          value={rooms.length}
          subtitle="Active campus inventory"
          icon={<Building2 className="h-5 w-5" />}
          colorScheme="emerald"
        />
        <MetricCard
          title="Total Bookings"
          value={bookings.length}
          subtitle="Processed requests"
          icon={<CalendarCheck className="h-5 w-5" />}
          colorScheme="rose"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'rooms'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Resource Management (Rooms)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-current font-bold">
            {rooms.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('societies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'societies'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Society Management</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-current font-bold">
            {societies.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Resource Management (Rooms) */}
      {activeTab === 'rooms' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Campus Rooms & Venues Inventory</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage capacity, audio-visual equipment, and active availability status.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/70">
                <tr>
                  <th className="px-6 py-3.5">Room Name</th>
                  <th className="px-4 py-3.5">Campus Location</th>
                  <th className="px-4 py-3.5">Room Type</th>
                  <th className="px-4 py-3.5">Capacity</th>
                  <th className="px-4 py-3.5">Facilities</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{room.name}</td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {room.locationId}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{room.type}</td>
                    <td className="px-4 py-4 font-semibold text-slate-800">{room.capacity} seats</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {room.facilities.slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]"
                          >
                            {f}
                          </span>
                        ))}
                        {room.facilities.length > 3 && (
                          <span className="text-[10px] text-slate-400">
                            +{room.facilities.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={room.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditRoom(room)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          title="Edit Room Details"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleRoomStatus(room)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            room.status === 'Unavailable'
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                          }`}
                          title={
                            room.status === 'Unavailable'
                              ? 'Enable Room'
                              : 'Disable Room / Maintenance'
                          }
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Society Management */}
      {activeTab === 'societies' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Registered Student Societies</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Societies authorized to initiate resource and venue bookings.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/70">
                <tr>
                  <th className="px-6 py-3.5">Society Name & Code</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">President / Lead</th>
                  <th className="px-4 py-3.5">Lead Email</th>
                  <th className="px-4 py-3.5">Active Members</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {societies.map((soc) => (
                  <tr key={soc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{soc.name}</div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {soc.code}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {soc.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800">{soc.leadName}</td>
                    <td className="px-4 py-4 text-slate-500 font-mono text-[11px]">
                      {soc.leadEmail}
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-800">{soc.memberCount}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSociety(soc)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        title="Edit Society Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Room Modal */}
      <Modal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        title={editingRoom ? 'Edit Room' : 'Add New Campus Room'}
        subtitle="Manage resource specifications in the central campus registry"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">
              Room Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g., C-305 Smart Tutorial Hall"
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Campus Location <span className="text-rose-500">*</span>
              </label>
              <select
                value={roomLocationId}
                onChange={(e) => setRoomLocationId(e.target.value as CampusLocationCode)}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none bg-white font-medium"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.id} - {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Capacity (Seats) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={10}
                max={2000}
                required
                value={roomCapacity}
                onChange={(e) => setRoomCapacity(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">Room Type</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="Classroom">Classroom</option>
              <option value="Lecture Hall">Lecture Hall</option>
              <option value="Auditorium">Auditorium</option>
              <option value="Meeting Room">Meeting Room</option>
              <option value="Open Space">Open Space</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">
              Facilities (Comma-separated)
            </label>
            <input
              type="text"
              value={roomFacilities}
              onChange={(e) => setRoomFacilities(e.target.value)}
              placeholder="Dual Projectors, AC, Wireless Mic, Tiered Seating"
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowRoomModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              {editingRoom ? 'Save Changes' : 'Add Room'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Society Modal */}
      <Modal
        isOpen={showSocietyModal}
        onClose={() => setShowSocietyModal(false)}
        title={editingSociety ? 'Edit Society' : 'Register Campus Society'}
        subtitle="Manage student chapter details and official representatives"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSociety} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Society Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={socName}
                onChange={(e) => setSocName(e.target.value)}
                placeholder="e.g., Robotics Club of Thapar"
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Society Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={socCode}
                onChange={(e) => setSocCode(e.target.value)}
                placeholder="e.g., RCT"
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">Category</label>
              <select
                value={socCategory}
                onChange={(e) => setSocCategory(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none bg-white font-medium"
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Entrepreneurship">Entrepreneurship</option>
                <option value="Social">Social</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Member Count
              </label>
              <input
                type="number"
                min={5}
                value={socMembers}
                onChange={(e) => setSocMembers(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Student Lead / President
              </label>
              <input
                type="text"
                required
                value={socLead}
                onChange={(e) => setSocLead(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Lead Institutional Email
              </label>
              <input
                type="email"
                required
                value={socLeadEmail}
                onChange={(e) => setSocLeadEmail(e.target.value)}
                placeholder="lead@thapar.edu"
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowSocietyModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              {editingSociety ? 'Save Changes' : 'Register Society'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
