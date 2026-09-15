import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  AlertCircle,
  FileText,
  UserCheck,
  Building2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Booking, WorkshopDetails, EventDetails, SocietyPrepDetails } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onApprove?: (booking: Booking) => void;
  onReject?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  canManage?: boolean;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
  onApprove,
  onReject,
  onCancel,
  canManage = false,
}) => {
  if (!booking) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Request Details"
      subtitle={`Reference ID: ${booking.id}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Status Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{booking.roomName}</p>
              <p className="text-xs text-slate-500">Location: {booking.locationName} ({booking.locationId})</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <StatusBadge status={booking.status} size="lg" />
          </div>
        </div>

        {/* Reviewer / Decision Callout */}
        {booking.status === 'Approved' && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <p className="font-semibold text-sm text-emerald-800">
                Approved by {booking.reviewedByName || 'Permission In-charge'}
              </p>
              {booking.reviewedAt && (
                <p className="text-emerald-700 mt-0.5">
                  Processed on {new Date(booking.reviewedAt).toLocaleDateString()} at{' '}
                  {new Date(booking.reviewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              {booking.approvalRemarks && (
                <p className="mt-2 text-emerald-800 bg-white/70 p-2.5 rounded-lg border border-emerald-200">
                  <span className="font-medium">Remarks:</span> {booking.approvalRemarks}
                </p>
              )}
            </div>
          </div>
        )}

        {booking.status === 'Rejected' && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 w-full">
              <p className="font-semibold text-sm text-rose-800">
                Booking Request Rejected by {booking.reviewedByName || 'Permission In-charge'}
              </p>
              <div className="mt-2 p-3 bg-white/80 rounded-lg border border-rose-200 text-rose-950 font-medium">
                <span className="font-semibold text-rose-800">Rejection Reason:</span>{' '}
                {booking.rejectionReason || 'No specific reason provided.'}
              </div>
            </div>
          </div>
        )}

        {booking.status === 'Pending' && (
          <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-xs font-medium text-amber-900">
              This request is currently under review by the Permission In-charge. You will receive an immediate notification once approved.
            </p>
          </div>
        )}

        {/* Core Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Users className="h-4 w-4 text-blue-600" />
              <span>Society</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">{booking.societyName}</p>
            <p className="text-xs text-slate-500 mt-0.5">Applicant: {booking.submittedByName}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>Activity Type</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">{booking.activityType}</p>
            <p className="text-xs text-slate-500 mt-0.5">Capacity: {booking.participantCount} attendees</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Permission Category</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">{booking.permissionType}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {booking.permissionType === 'Night Permission' ? 'Post 08:00 PM Protocol' : 'Standard Daytime Permit'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Scheduled Date</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">
              {new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Time Slot</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">
              {booking.startTime} — {booking.endTime}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>Campus Zone</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">{booking.locationId}</p>
            <p className="text-xs text-slate-500 mt-0.5">{booking.locationName}</p>
          </div>
        </div>

        {/* Dynamic Activity-Specific Specifications */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Activity Details & Equipment Specifications
          </h4>

          {booking.activityType === 'Workshop / Session' && (
            <div className="space-y-3 text-xs">
              {('workshopName' in booking.details) && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 font-medium">Session Title:</span>
                      <p className="text-sm font-semibold text-slate-900">
                        {(booking.details as WorkshopDetails).workshopName}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Speaker / Trainer:</span>
                      <p className="text-sm font-semibold text-slate-900">
                        {(booking.details as WorkshopDetails).speaker}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Equipment Requested:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(booking.details as WorkshopDetails).equipmentRequired?.map((eq, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 font-medium"
                        >
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {booking.activityType === 'Event' && (
            <div className="space-y-3 text-xs">
              {('eventName' in booking.details) && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 font-medium">Event Title:</span>
                      <p className="text-sm font-semibold text-slate-900">
                        {(booking.details as EventDetails).eventName}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Coordinator:</span>
                      <p className="text-sm font-semibold text-slate-900">
                        {(booking.details as EventDetails).coordinator}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Stage & Setup Requirements:</span>
                    <p className="mt-1 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      {(booking.details as EventDetails).setupRequirements}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Equipment & Sound Requirements:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(booking.details as EventDetails).equipmentRequired?.map((eq, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-100 font-medium"
                        >
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {booking.activityType === 'Society Preparation' && (
            <div className="space-y-2 text-xs">
              {('memberCount' in booking.details) && (
                <>
                  <div>
                    <span className="text-slate-500 font-medium">Rehearsal / Prep Purpose:</span>
                    <p className="mt-1 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      {(booking.details as SocietyPrepDetails).purpose}
                    </p>
                  </div>
                  {(booking.details as SocietyPrepDetails).additionalRequirements && (
                    <div>
                      <span className="text-slate-500 font-medium">Additional Requirements:</span>
                      <p className="mt-1 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        {(booking.details as SocietyPrepDetails).additionalRequirements}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Stated Purpose */}
          <div className="pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Stated Booking Purpose:</span>
            <p className="mt-1 text-slate-800 italic">"{booking.purpose}"</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-400">
            Submitted on {new Date(booking.submittedAt).toLocaleDateString()} at{' '}
            {new Date(booking.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Close
            </button>

            {/* In-Charge Controls */}
            {canManage && booking.status === 'Pending' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (onReject) onReject(booking);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Reject Request
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onApprove) onApprove(booking);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                >
                  <UserCheck className="h-4 w-4" />
                  Approve Request
                </button>
              </>
            )}

            {/* Student Cancel Control */}
            {!canManage && booking.status === 'Pending' && onCancel && (
              <button
                type="button"
                onClick={() => onCancel(booking)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
