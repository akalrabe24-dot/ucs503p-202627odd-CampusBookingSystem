create schema if not exists extensions;
create extension if not exists btree_gist with schema extensions;
set search_path = public, extensions;

create table public.locations (
  id text primary key,
  name text not null,
  block text,
  capacity integer check (capacity >= 0),
  category text not null,
  description text not null,
  "totalRooms" integer not null check ("totalRooms" >= 0)
);

create table public.resources (
  id text primary key,
  "locationId" text not null references public.locations,
  name text not null,
  capacity integer not null check (capacity > 0),
  type text not null check (type in ('Lecture Hall', 'Classroom', 'Auditorium', 'Meeting Room', 'Open Space')),
  facilities text[] not null default '{}',
  status text not null default 'Available' check (status in ('Available', 'Unavailable')),
  floor text,
  unique (id, "locationId")
);

create table public.societies (
  id text primary key,
  name text not null,
  code text not null unique,
  category text not null check (category in ('Technical', 'Cultural', 'Entrepreneurship', 'Social', 'Sports')),
  "leadName" text not null,
  "leadEmail" text not null,
  "memberCount" integer not null check ("memberCount" >= 0),
  description text not null,
  "facultyAdvisor" text
);

create table public.profiles (
  id uuid primary key references auth.users,
  name text not null,
  email text not null,
  roll_no text,
  role text not null check (role in ('student', 'incharge', 'admin')),
  "societyId" text references public.societies,
  designation text,
  check (role <> 'student' or "societyId" is not null)
);

create table public.activity_types (
  id text primary key,
  name text not null unique,
  description text
);
insert into public.activity_types (id, name) values
  ('Society Preparation', 'Society Preparation'),
  ('Workshop / Session', 'Workshop / Session'),
  ('Event', 'Event');

create sequence public.booking_number;
create table public.bookings (
  id text primary key default ('CRB-' || extract(year from timezone('Asia/Kolkata', now())) || '-' || nextval('public.booking_number')),
  user_id uuid not null references public.profiles,
  society_id text not null references public.societies,
  location_id text not null references public.locations,
  resource_id text not null,
  activity_type_id text not null references public.activity_types,
  booking_date date not null,
  start_time time(0) not null,
  end_time time(0) not null,
  permission_category text not null check (permission_category in ('Morning Permission', 'Night Permission')),
  purpose text not null check (length(btrim(purpose)) > 0),
  participant_count integer not null check (participant_count > 0),
  activity_details jsonb not null check (jsonb_typeof(activity_details) = 'object'),
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected', 'Cancelled')),
  request_timestamp timestamptz not null default now(),
  foreign key (resource_id, location_id) references public.resources (id, "locationId"),
  check (extract(second from start_time) = 0 and extract(second from end_time) = 0),
  check (start_time >= time '08:00' and end_time <= time '22:00' and start_time < end_time),
  check (end_time <= time '20:00' or permission_category = 'Night Permission'),
  exclude using gist (
    resource_id with =,
    tsrange(booking_date + start_time, booking_date + end_time, '[)') with &&
  ) where (status in ('Pending', 'Approved'))
);
create index bookings_owner_idx on public.bookings (user_id);
create index bookings_schedule_idx on public.bookings (resource_id, booking_date);

create table public.permissions (
  id bigint generated always as identity primary key,
  booking_id text not null unique references public.bookings,
  approver_id uuid not null references public.profiles,
  approver_name text not null,
  decision text not null check (decision in ('Approved', 'Rejected')),
  reason text,
  decision_timestamp timestamptz not null default now()
);

create table public.maintenance_unavailability (
  id bigint generated always as identity primary key,
  resource_id text not null references public.resources,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null,
  status text not null default 'Active' check (status in ('Active', 'Cancelled')),
  check (starts_at < ends_at),
  check (date_trunc('minute', starts_at) = starts_at and date_trunc('minute', ends_at) = ends_at)
);
create index maintenance_resource_idx on public.maintenance_unavailability (resource_id, starts_at);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles,
  booking_id text not null references public.bookings,
  title text not null,
  message text not null,
  type text not null check (type in ('info', 'success', 'warning', 'error')),
  created_at timestamptz not null default now(),
  read boolean not null default false
);
create index notifications_inbox_idx on public.notifications (recipient_id, created_at desc);

create function public.campus_role() returns text
language sql stable security definer set search_path = ''
as $$ select role from public.profiles where id = (select auth.uid()) $$;

alter table public.locations enable row level security;
alter table public.resources enable row level security;
alter table public.societies enable row level security;
alter table public.profiles enable row level security;
alter table public.activity_types enable row level security;
alter table public.bookings enable row level security;
alter table public.permissions enable row level security;
alter table public.maintenance_unavailability enable row level security;
alter table public.notifications enable row level security;

revoke all on public.locations, public.resources, public.societies, public.profiles,
  public.activity_types, public.bookings, public.permissions, public.maintenance_unavailability,
  public.notifications from public, anon, authenticated;
grant select on public.locations, public.resources, public.societies, public.profiles,
  public.activity_types, public.bookings, public.permissions, public.maintenance_unavailability,
  public.notifications to authenticated;
grant insert, update on public.resources, public.societies, public.maintenance_unavailability to authenticated;
grant update (read) on public.notifications to authenticated;
revoke all on sequence public.booking_number from public, anon, authenticated;

create policy locations_read on public.locations for select to authenticated using ((select public.campus_role()) is not null);
create policy resources_read on public.resources for select to authenticated using ((select public.campus_role()) is not null);
create policy societies_read on public.societies for select to authenticated using ((select public.campus_role()) is not null);
create policy activity_types_read on public.activity_types for select to authenticated using ((select public.campus_role()) is not null);
create policy resources_insert on public.resources for insert to authenticated with check ((select public.campus_role()) = 'admin');
create policy resources_update on public.resources for update to authenticated using ((select public.campus_role()) = 'admin') with check ((select public.campus_role()) = 'admin');
create policy societies_insert on public.societies for insert to authenticated with check ((select public.campus_role()) = 'admin');
create policy societies_update on public.societies for update to authenticated using ((select public.campus_role()) = 'admin') with check ((select public.campus_role()) = 'admin');
create policy maintenance_admin on public.maintenance_unavailability for all to authenticated using ((select public.campus_role()) = 'admin') with check ((select public.campus_role()) = 'admin');
create policy profiles_read on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.campus_role()) in ('incharge', 'admin'));
create policy bookings_read on public.bookings for select to authenticated
  using (user_id = (select auth.uid()) or (select public.campus_role()) in ('incharge', 'admin'));
create policy permissions_read on public.permissions for select to authenticated
  using (exists (select 1 from public.bookings b where b.id = booking_id));
create policy notifications_read on public.notifications for select to authenticated using (recipient_id = (select auth.uid()));
create policy notifications_update on public.notifications for update to authenticated
  using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));

create view public.portal_bookings with (security_invoker = true) as
select b.id, b.society_id as "societyId", s.name as "societyName", b.activity_type_id as "activityType",
  b.location_id as "locationId", l.name as "locationName",
  b.resource_id as "roomId", r.name as "roomName", b.booking_date as date,
  to_char(b.start_time, 'HH24:MI') as "startTime", to_char(b.end_time, 'HH24:MI') as "endTime",
  b.permission_category as "permissionType", b.purpose, b.participant_count as "participantCount",
  b.activity_details as details, b.status, b.user_id as "submittedBy", u.name as "submittedByName",
  b.request_timestamp as "submittedAt", p.approver_id as "reviewedBy", p.approver_name as "reviewedByName",
  p.decision_timestamp as "reviewedAt",
  case when p.decision = 'Rejected' then p.reason end as "rejectionReason",
  case when p.decision = 'Approved' then p.reason end as "approvalRemarks"
from public.bookings b
join public.profiles u on u.id = b.user_id
join public.societies s on s.id = b.society_id
join public.locations l on l.id = b.location_id
join public.resources r on r.id = b.resource_id
left join public.permissions p on p.booking_id = b.id;
revoke all on public.portal_bookings from public, anon, authenticated;
grant select on public.portal_bookings to authenticated;

-- Booking submissions, approval and maintenance changes serialize on the resource row.
create function public.lock_maintenance_resource() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and old.resource_id <> new.resource_id then
    raise exception 'Create a new maintenance entry to change the resource';
  end if;
  perform 1 from public.resources where id = new.resource_id for update;
  if new.status = 'Active' and exists (
    select 1 from public.bookings b where b.resource_id = new.resource_id
      and b.status in ('Pending', 'Approved')
      and (b.booking_date + b.start_time) at time zone 'Asia/Kolkata' < new.ends_at
      and (b.booking_date + b.end_time) at time zone 'Asia/Kolkata' > new.starts_at
  ) then
    raise exception 'Maintenance overlaps an active booking' using errcode = '23P01';
  end if;
  return new;
end;
$$;
create trigger lock_maintenance_resource before insert or update on public.maintenance_unavailability
for each row execute function public.lock_maintenance_resource();

create function public.submit_booking(
  p_resource text, p_society text, p_activity text, p_date date, p_start time, p_end time,
  p_permission text, p_purpose text, p_participants integer, p_details jsonb
) returns text
language plpgsql security definer set search_path = '' as $$
declare
  applicant public.profiles%rowtype;
  room public.resources%rowtype;
  new_id text;
begin
  select * into applicant from public.profiles where id = auth.uid();
  if applicant.role is distinct from 'student' or applicant."societyId" is distinct from p_society then
    raise exception 'Only assigned society representatives may submit bookings' using errcode = '42501';
  end if;
  select * into room from public.resources where id = p_resource for update;
  if not found or room.status = 'Unavailable' then
    raise exception 'This room is unavailable' using errcode = '23P01';
  end if;
  if p_participants > room.capacity then
    raise exception 'Participant count exceeds room capacity' using errcode = '23514';
  end if;
  if (p_date + p_start) <= timezone('Asia/Kolkata', now()) then
    raise exception 'Choose a future time in campus time (IST)' using errcode = '23514';
  end if;
  if exists (
    select 1 from public.maintenance_unavailability m where m.resource_id = room.id and m.status = 'Active'
      and m.starts_at < (p_date + p_end) at time zone 'Asia/Kolkata'
      and m.ends_at > (p_date + p_start) at time zone 'Asia/Kolkata'
  ) then
    raise exception 'This slot is blocked for maintenance' using errcode = '23P01';
  end if;
  insert into public.bookings (user_id, society_id, location_id, resource_id, activity_type_id,
    booking_date, start_time, end_time, permission_category, purpose, participant_count, activity_details)
  values (applicant.id, applicant."societyId", room."locationId", room.id, p_activity,
    p_date, p_start, p_end, p_permission, p_purpose, p_participants, p_details)
  returning id into new_id;
  insert into public.notifications (recipient_id, booking_id, title, message, type)
    select id, new_id, 'New booking awaiting approval', room.name || ' on ' || p_date, 'info'
    from public.profiles where role = 'incharge';
  return new_id;
end;
$$;

create function public.change_booking_status(p_booking text, p_status text, p_reason text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare
  actor public.profiles%rowtype;
  request public.bookings%rowtype;
  room public.resources%rowtype;
begin
  select * into actor from public.profiles where id = auth.uid();
  if actor.id is null then raise exception 'Account lacks a campus profile' using errcode = '42501'; end if;
  select * into request from public.bookings where id = p_booking
    and (user_id = actor.id or actor.role in ('incharge', 'admin')) for update;
  if not found then raise exception 'Booking unavailable to this account' using errcode = '42501'; end if;

  if p_status in ('Approved', 'Rejected') and actor.role in ('incharge', 'admin') and request.status = 'Pending' then
    if p_status = 'Rejected' and nullif(btrim(p_reason), '') is null then
      raise exception 'Enter a rejection reason' using errcode = '23514';
    end if;
    if p_status = 'Approved' then
      select * into room from public.resources where id = request.resource_id for update;
      if room.status = 'Unavailable' or room.capacity < request.participant_count
        or (request.booking_date + request.start_time) <= timezone('Asia/Kolkata', now()) then
        raise exception 'The resource, capacity, or start time is no longer available' using errcode = '23P01';
      end if;
    end if;
    insert into public.permissions (booking_id, approver_id, approver_name, decision, reason)
    values (request.id, actor.id, actor.name, p_status, p_reason);
  elsif p_status = 'Cancelled' and request.status in ('Pending', 'Approved')
    and (request.user_id = actor.id or actor.role in ('incharge', 'admin')) then
    null;
  else
    raise exception 'This booking cannot be changed to that status' using errcode = '42501';
  end if;

  update public.bookings set status = p_status where id = request.id;
  insert into public.notifications (recipient_id, booking_id, title, message, type)
  values (request.user_id, request.id, 'Booking ' || lower(p_status),
    request.id || ' was ' || lower(p_status) || coalesce('. ' || nullif(btrim(p_reason), ''), '.'),
    case p_status when 'Approved' then 'success' when 'Rejected' then 'error' else 'warning' end);
end;
$$;

-- Availability returns busy times only. Booking details remain under booking RLS.
create function public.room_schedule(p_resource text, p_date date)
returns table ("startTime" text, "endTime" text, status text)
language sql stable security definer set search_path = '' as $$
  select to_char(b.start_time, 'HH24:MI'), to_char(b.end_time, 'HH24:MI'), b.status
  from public.bookings b
  where (select public.campus_role()) is not null
    and b.resource_id = p_resource and b.booking_date = p_date and b.status in ('Pending', 'Approved')
  union all
  select
    to_char(greatest(m.starts_at at time zone 'Asia/Kolkata', p_date::timestamp), 'HH24:MI'),
    case when (m.ends_at at time zone 'Asia/Kolkata') >= (p_date + 1)::timestamp then '24:00'
         else to_char(m.ends_at at time zone 'Asia/Kolkata', 'HH24:MI') end,
    'Unavailable'
  from public.maintenance_unavailability m
  where (select public.campus_role()) is not null and m.resource_id = p_resource and m.status = 'Active'
    and m.starts_at < ((p_date + 1)::timestamp at time zone 'Asia/Kolkata')
    and m.ends_at > (p_date::timestamp at time zone 'Asia/Kolkata')
$$;

revoke all on function public.lock_maintenance_resource() from public, anon, authenticated;
revoke all on function public.campus_role(), public.room_schedule(text, date),
  public.change_booking_status(text, text, text),
  public.submit_booking(text, text, text, date, time, time, text, text, integer, jsonb) from public, anon, authenticated;
grant execute on function public.campus_role(), public.room_schedule(text, date),
  public.change_booking_status(text, text, text),
  public.submit_booking(text, text, text, date, time, time, text, text, integer, jsonb) to authenticated;
reset search_path;
