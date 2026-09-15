export type CampusLocationCode =
  | 'LP'
  | 'LT'
  | 'TAN'
  | 'B Block'
  | 'C Block'
  | 'D Block'
  | 'E Block'
  | 'F Block'
  | 'Main Auditorium'
  | 'GR1'
  | 'GR2'
  | 'CR';

export type ActivityType =
  | 'Society Preparation'
  | 'Workshop / Session'
  | 'Event';

export type PermissionType =
  | 'Morning Permission'
  | 'Night Permission';

export type BookingStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled';

export type RoomStatus =
  | 'Available'
  | 'Booked'
  | 'Pending'
  | 'Unavailable';

export type UserRole =
  | 'student'
  | 'incharge'
  | 'admin';

export interface CampusLocation {
  id: CampusLocationCode;
  name: string;
  category: 'Academic' | 'Lecture Complex' | 'Auditorium' | 'Outdoor / Grounds' | 'Common';
  description: string;
  totalRooms: number;
}

export interface CampusRoom {
  id: string;
  name: string;
  locationId: CampusLocationCode;
  capacity: number;
  type: 'Lecture Hall' | 'Classroom' | 'Auditorium' | 'Meeting Room' | 'Open Space';
  facilities: string[];
  status: RoomStatus;
  floor?: string;
}

export interface Society {
  id: string;
  name: string;
  code: string;
  category: 'Technical' | 'Cultural' | 'Entrepreneurship' | 'Social' | 'Sports';
  leadName: string;
  leadEmail: string;
  memberCount: number;
  description: string;
  facultyAdvisor?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation?: string;
  societyId?: string;
  societyName?: string;
  avatar?: string;
}

export interface SocietyPrepDetails {
  purpose: string;
  memberCount: number;
  additionalRequirements?: string;
}

export interface WorkshopDetails {
  workshopName: string;
  speaker: string;
  expectedParticipants: number;
  equipmentRequired: string[];
  purpose: string;
}

export interface EventDetails {
  eventName: string;
  coordinator: string;
  expectedAttendance: number;
  setupRequirements: string;
  equipmentRequired: string[];
  additionalRequirements?: string;
}

export type ActivityDetails =
  | SocietyPrepDetails
  | WorkshopDetails
  | EventDetails;

export interface Booking {
  id: string;
  societyId: string;
  societyName: string;
  activityType: ActivityType;
  locationId: CampusLocationCode;
  locationName: string;
  roomId: string;
  roomName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm format, e.g. "10:00"
  endTime: string; // HH:mm format, e.g. "13:00"
  permissionType: PermissionType;
  purpose: string;
  participantCount: number;
  details: ActivityDetails;
  status: BookingStatus;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string; // ISO string
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  approvalRemarks?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  bookingId?: string;
  recipientRole?: UserRole | 'all';
}
