import React, { useState } from 'react';
import { AlertTriangle, Send } from 'lucide-react';
import { Booking } from '../../types';
import { Modal } from '../common/Modal';

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onConfirmReject: (bookingId: string, reason: string) => void;
}

export const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  booking,
  onConfirmReject,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!booking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a specific rejection reason so the applicant society is informed.');
      return;
    }
    onConfirmReject(booking.id, reason.trim());
    setReason('');
    setError('');
    onClose();
  };

  const presetReasons = [
    'Room is already reserved for scheduled university exams / official academic symposium.',
    'High noise decibel levels violate evening quiet hours in this academic zone.',
    'Capacity requirements exceed the permitted occupancy of this specific venue.',
    'Incomplete faculty coordinator sign-off or external speaker clearance missing.',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setReason('');
        setError('');
        onClose();
      }}
      title="Reject Booking Request"
      subtitle={`Request #${booking.id} — ${booking.societyName}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-900">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Action requires justification:</span>
            <p className="mt-0.5 text-rose-800">
              The applicant society ({booking.societyName}) will receive an official notification containing this explanation.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Quick Select Common Reasons:
          </label>
          <div className="space-y-1.5">
            {presetReasons.map((preset, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setReason(preset)}
                className="w-full text-left p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-200 text-xs text-slate-700 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="rejectionReason" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Detailed Rejection Reason <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="rejectionReason"
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            placeholder="Specify why this booking cannot be approved at this time..."
            className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
          >
            <Send className="h-4 w-4" />
            Confirm Rejection
          </button>
        </div>
      </form>
    </Modal>
  );
};
