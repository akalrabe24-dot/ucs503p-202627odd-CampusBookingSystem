import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';

const db = await PGlite.create({ extensions: { btree_gist } });
const alice = '10000000-0000-4000-8000-000000000001';
const bob = '10000000-0000-4000-8000-000000000002';
const reviewer = '10000000-0000-4000-8000-000000000003';
const admin = '10000000-0000-4000-8000-000000000004';
const future = '2099-02-12';
const fixture = path => readFile(new URL('../../supabase/' + path, import.meta.url), 'utf8');
const query = async (sql, params) => (await db.query(sql, params)).rows;

async function asUser(id) {
  await db.exec('reset role; set role authenticated');
  await query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
}
async function submit(start, end, options = {}) {
  const rows = await query(`
    select public.submit_booking('LT-101', $1, 'Event', $2, $3, $4, $5, 'Private program',
      $6, '{"eventName":"Test event"}') as id
  `, [options.society ?? 'soc-ieee', future, start, end, options.permission ?? 'Morning Permission', options.count ?? 12]);
  return rows[0].id;
}
const change = (id, status, reason = null) => query(
  'select public.change_booking_status($1, $2, $3)', [id, status, reason],
);

try {
  // Model Supabase's API roles and auth.uid(); run the actual migration and seed unchanged.
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated;
  `);
  await db.exec(await fixture('migrations/20261116000100_campus_booking.sql'));
  await db.exec(await fixture('seed.sql'));
  for (const [id, name, role] of [
    [alice, 'Alice', 'student'], [bob, 'Bob', 'student'],
    [reviewer, 'Reviewer', 'incharge'], [admin, 'Admin', 'admin'],
  ]) {
    await query('insert into auth.users values ($1)', [id]);
    await query('insert into public.profiles (id, name, email, role, "societyId") values ($1,$2,$3,$4,$5)',
      [id, name, name.toLowerCase() + '@example.test', role, role === 'student' ? 'soc-ieee' : null]);
  }

  await db.exec('set role anon');
  await assert.rejects(query('select * from public.portal_bookings'), { code: '42501' });
  await assert.rejects(query("select * from public.room_schedule('LT-101', $1)", [future]), { code: '42501' });

  await asUser(alice);
  await assert.rejects(query("update public.profiles set role = 'admin'"), { code: '42501' });
  await assert.rejects(query("insert into public.resources (id) values ('forged')"), { code: '42501' });
  await assert.rejects(submit('10:00', '11:00', { society: 'soc-forged' }), { code: '42501' });
  await assert.rejects(submit('10:00', '11:00', { count: 9999 }), { code: '23514' });
  await assert.rejects(submit('20:00', '21:00'), { code: '23514' });
  const night = await submit('20:00', '21:00', { permission: 'Night Permission' });
  assert.ok(night.startsWith('CRB-'));

  const first = await submit('10:00', '11:00');
  await assert.rejects(change(first, 'Approved'), { code: '42501' });
  await assert.rejects(query("update public.bookings set status = 'Approved'"), { code: '42501' });

  await asUser(bob);
  assert.deepEqual(await query('select * from public.portal_bookings'), []);
  await assert.rejects(change(first, 'Cancelled'), { code: '42501' });
  await assert.rejects(submit('10:30', '11:30'), { code: '23P01' });
  const adjacent = await submit('11:00', '12:00');
  const busy = await query("select * from public.room_schedule('LT-101', $1) where \"startTime\" = '10:00'", [future]);
  assert.deepEqual(busy, [{ startTime: '10:00', endTime: '11:00', status: 'Pending' }]);

  await asUser(reviewer);
  assert.equal((await query('select * from public.notifications')).length, 3);
  await assert.rejects(change(adjacent, 'Rejected'), { code: '23514' });
  await change(adjacent, 'Rejected', 'Time unsuitable');
  await change(first, 'Approved', 'Confirmed');
  await assert.rejects(change(first, 'Rejected', 'Second decision'), { code: '42501' });
  assert.equal((await query('select * from public.permissions')).length, 2);

  await asUser(alice);
  const approved = (await query('select * from public.portal_bookings where id = $1', [first]))[0];
  assert.equal(approved.approvalRemarks, 'Confirmed');
  assert.equal(approved.reviewedByName, 'Reviewer');
  const inbox = await query('select * from public.notifications');
  assert.equal(inbox.length, 1);
  assert.equal(inbox[0].booking_id, first);
  await assert.rejects(query("update public.notifications set message = 'spoofed'"), { code: '42501' });
  await query('update public.notifications set read = true');
  assert.equal((await query('select read from public.notifications'))[0].read, true);
  await change(first, 'Cancelled');
  await submit('10:00', '11:00');

  await asUser(admin);
  const maintenance = (start, end) => query(`
    insert into public.maintenance_unavailability (resource_id, starts_at, ends_at, reason)
      values ('LT-101', $1, $2, 'Private maintenance note')
  `, [start, end]);
  await assert.rejects(maintenance(future + 'T10:15:00+05:30', future + 'T10:45:00+05:30'), { code: '23P01' });
  await maintenance(future + 'T12:00:00+05:30', future + 'T13:00:00+05:30');
  await query("update public.resources set status = 'Unavailable' where id = 'LT-102'");

  await asUser(bob);
  assert.deepEqual(await query('select * from public.maintenance_unavailability'), []);
  assert.deepEqual(await query("select * from public.room_schedule('LT-101', $1) where status = 'Unavailable'", [future]),
    [{ startTime: '12:00', endTime: '13:00', status: 'Unavailable' }]);
  await assert.rejects(submit('12:15', '12:45'), { code: '23P01' });
  assert.equal((await query('select * from public.portal_bookings')).length, 1);
  console.log('Passed PostgreSQL migration, RLS, booking, approval, maintenance and inbox checks.');
} finally {
  await db.close();
}
