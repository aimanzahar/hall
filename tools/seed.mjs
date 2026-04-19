#!/usr/bin/env node
// tools/seed.mjs — Bootstraps PocketBase for HallBook.
//
// Usage (from repo root):
//   cp tools/.env.example tools/.env && <edit creds>
//   node tools/seed.mjs
//
// What it does:
//   1. Superuser-authenticates against PocketBase.
//   2. Creates the `admins` (auth), `venues` (base), and `bookings` (base)
//      collections if they don't exist; updates rules if they do.
//   3. Downloads venue hero photos and uploads them to PocketBase.
//   4. Seeds Malaysian venue records.
//   5. Creates a demo admin (via `admins` collection) and a demo user.
//   6. Seeds a few sample bookings across the three statuses so the admin
//      dashboard has something to show on first login.
//
// Re-running is safe — existing rows are updated in place.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Buffer } from 'node:buffer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------- tiny .env loader (no dependency) ----------
function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  const raw = fs.readFileSync(file, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv(path.join(__dirname, '.env'));

const PB_URL = (process.env.PB_URL || 'http://127.0.0.1:8090').replace(/\/$/, '');
const SU_EMAIL = process.env.PB_SUPERUSER_EMAIL;
const SU_PASSWORD = process.env.PB_SUPERUSER_PASSWORD;

if (!SU_EMAIL || !SU_PASSWORD) {
  console.error('Missing PB_SUPERUSER_EMAIL / PB_SUPERUSER_PASSWORD in tools/.env');
  process.exit(1);
}

// ---------- pretty logging ----------
const log = {
  step: (m) => console.log('\n» ' + m),
  ok: (m) => console.log('  ✓ ' + m),
  warn: (m) => console.log('  ! ' + m),
  err: (m) => console.error('  ✗ ' + m),
};

// ---------- HTTP helpers ----------
let authToken = null;

async function api(method, p, body, { raw = false, headers: extra = {} } = {}) {
  const url = PB_URL + p;
  const headers = { ...extra };
  if (authToken) headers['Authorization'] = authToken;
  let payload;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(url, { method, headers, body: payload });
  const text = await res.text();
  if (!res.ok) {
    const snippet = text.length > 600 ? text.slice(0, 600) + '…' : text;
    throw new Error(`${method} ${p} → ${res.status}: ${snippet}`);
  }
  if (raw) return text;
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

async function superuserAuth() {
  log.step(`Authenticating as superuser at ${PB_URL}`);
  const res = await api('POST', '/api/collections/_superusers/auth-with-password', {
    identity: SU_EMAIL,
    password: SU_PASSWORD,
  });
  authToken = res.token;
  log.ok('Superuser session obtained');
}

async function getCollectionByName(name) {
  try {
    return await api('GET', `/api/collections/${name}`);
  } catch (e) {
    if (/404/.test(e.message)) return null;
    throw e;
  }
}

async function upsertCollection(def) {
  const existing = await getCollectionByName(def.name);
  if (!existing) {
    await api('POST', '/api/collections', def);
    log.ok(`Created collection: ${def.name}`);
    return await getCollectionByName(def.name);
  }
  // Update in place — PocketBase accepts the same shape for PATCH.
  // Preserve built-in system field IDs when updating an auth collection so the
  // API doesn't try to recreate them.
  const merged = { ...def, id: existing.id };
  await api('PATCH', `/api/collections/${existing.id}`, merged);
  log.ok(`Updated collection: ${def.name}`);
  return await getCollectionByName(def.name);
}

// ---------- collection schemas ----------
const adminsCollection = {
  name: 'admins',
  type: 'auth',
  listRule: 'id = @request.auth.id',
  viewRule: 'id = @request.auth.id',
  createRule: null,            // only superuser creates admins
  updateRule: 'id = @request.auth.id',
  deleteRule: null,
  fields: [
    { name: 'name', type: 'text', max: 120 },
  ],
  passwordAuth: { enabled: true, identityFields: ['email'] },
};

const venuesCollection = {
  name: 'venues',
  type: 'base',
  // Public browse; only admins can mutate.
  listRule: '',
  viewRule: '',
  createRule: '@request.auth.collectionName = "admins"',
  updateRule: '@request.auth.collectionName = "admins"',
  deleteRule: '@request.auth.collectionName = "admins"',
  fields: [
    { name: 'slug',        type: 'text',   required: true, max: 80 },
    { name: 'name',        type: 'text',   required: true, max: 160 },
    { name: 'district',    type: 'text',   required: true, max: 160 },
    { name: 'state',       type: 'text',   required: true, max: 80 },
    { name: 'capacity',    type: 'number', required: true, min: 1 },
    { name: 'priceHour',   type: 'number', required: true, min: 0 },
    { name: 'rating',      type: 'number' },
    { name: 'reviews',     type: 'number' },
    { name: 'tags',        type: 'json',   maxSize: 10000 },
    { name: 'available',   type: 'select', values: ['now', 'soon', 'booked'], maxSelect: 1 },
    { name: 'nextGap',     type: 'text',   max: 200 },
    { name: 'coord',       type: 'json',   maxSize: 1000 },
    { name: 'hero',        type: 'select', values: ['warm', 'cool', 'sage', 'ink', 'amber', 'stone'], maxSelect: 1 },
    { name: 'size',        type: 'text',   max: 60 },
    { name: 'ceiling',     type: 'text',   max: 60 },
    { name: 'addons',      type: 'json',   maxSize: 5000 },
    { name: 'description', type: 'editor' },
    { name: 'image',       type: 'file',   maxSelect: 1, maxSize: 8 * 1024 * 1024,
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  ],
};

function bookingsCollection(userCol, venueCol) {
  return {
    name: 'bookings',
    type: 'base',
    // Customers read their own bookings; admins read all. Create requires a
    // signed-in user; mutation (approve / reject / cancel) is admin-only.
    listRule: '(@request.auth.id = user.id) || (@request.auth.collectionName = "admins")',
    viewRule: '(@request.auth.id = user.id) || (@request.auth.collectionName = "admins")',
    createRule: '@request.auth.collectionName = "users"',
    updateRule: '@request.auth.collectionName = "admins"',
    deleteRule: '@request.auth.collectionName = "admins"',
    fields: [
      { name: 'user',         type: 'relation', required: true,
        collectionId: userCol.id,  maxSelect: 1, cascadeDelete: true },
      { name: 'venue',        type: 'relation', required: true,
        collectionId: venueCol.id, maxSelect: 1, cascadeDelete: false },
      { name: 'venueName',    type: 'text',   max: 160 },
      { name: 'dateISO',      type: 'text',   required: true, max: 20 },
      { name: 'timeStart',    type: 'text',   required: true, max: 10 },
      { name: 'timeEnd',      type: 'text',   required: true, max: 10 },
      { name: 'dateLabel',    type: 'text',   max: 60 },
      { name: 'timeLabel',    type: 'text',   max: 60 },
      { name: 'guests',       type: 'number', required: true, min: 1 },
      { name: 'eventType',    type: 'text',   max: 60 },
      { name: 'contactName',  type: 'text',   required: true, max: 120 },
      { name: 'contactEmail', type: 'email',  required: true },
      { name: 'contactPhone', type: 'text',   required: true, max: 40 },
      { name: 'notes',        type: 'text',   max: 1200 },
      { name: 'status',       type: 'select', required: true,
        values: ['pending', 'approved', 'rejected'], maxSelect: 1 },
      { name: 'adminNote',    type: 'text',   max: 500 },
      { name: 'confirm',      type: 'text',   max: 40 },
      { name: 'total',        type: 'number', min: 0 },
    ],
  };
}

// ---------- record helpers ----------
async function findOne(collection, filter) {
  const q = encodeURIComponent(filter);
  const res = await api('GET', `/api/collections/${collection}/records?perPage=1&filter=${q}`);
  return res.items && res.items[0];
}

async function upsertRecord(collection, filter, data, fileFields = null) {
  const existing = await findOne(collection, filter);
  if (fileFields) {
    const form = new FormData();
    for (const [k, v] of Object.entries(data)) {
      form.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    }
    for (const [field, { blob, filename }] of Object.entries(fileFields)) {
      form.append(field, blob, filename);
    }
    if (existing) {
      return { record: await api('PATCH', `/api/collections/${collection}/records/${existing.id}`, form), created: false };
    }
    return { record: await api('POST', `/api/collections/${collection}/records`, form), created: true };
  }
  if (existing) {
    return { record: await api('PATCH', `/api/collections/${collection}/records/${existing.id}`, data), created: false };
  }
  return { record: await api('POST', `/api/collections/${collection}/records`, data), created: true };
}

async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image download ${url} → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get('content-type') || 'image/jpeg';
  return { blob: new Blob([buf], { type: mime }), mime };
}

function extFromMime(m) {
  if (m.includes('png')) return 'png';
  if (m.includes('webp')) return 'webp';
  return 'jpg';
}

// ---------- main ----------
async function main() {
  await superuserAuth();

  log.step('Ensuring collections');
  const usersCol  = await getCollectionByName('users');
  if (!usersCol) throw new Error('users collection missing — PocketBase install incomplete?');
  await upsertCollection(adminsCollection);
  const venuesCol = await upsertCollection(venuesCollection);
  await upsertCollection(bookingsCollection(usersCol, venuesCol));

  // --- Seed venues (with image upload) ---
  log.step('Seeding venues');
  const venuesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'venues.seed.json'), 'utf8'));
  const venueIds = {};
  for (const v of venuesData) {
    const { imageUrl, slug, ...fields } = v;
    const data = { ...fields, slug };
    let fileFields = null;
    try {
      const existing = await findOne('venues', `slug = "${slug}"`);
      const hasImage = existing && existing.image;
      if (!hasImage) {
        const { blob, mime } = await downloadImage(imageUrl);
        fileFields = { image: { blob, filename: `${slug}.${extFromMime(mime)}` } };
      }
    } catch (e) {
      log.warn(`${slug}: could not fetch image (${e.message}); continuing without photo`);
    }
    const { record, created } = await upsertRecord('venues', `slug = "${slug}"`, data, fileFields);
    venueIds[slug] = record.id;
    log.ok(`${created ? 'Created' : 'Updated'}: ${v.name}`);
  }

  // --- Demo admin ---
  log.step('Seeding demo admin');
  const adminEmail = process.env.DEMO_ADMIN_EMAIL || 'admin@hallbook.my';
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD || 'admin12345';
  const adminName = process.env.DEMO_ADMIN_NAME || 'Hall Admin';
  const existingAdmin = await findOne('admins', `email = "${adminEmail}"`);
  let adminRecord;
  if (existingAdmin) {
    adminRecord = await api('PATCH', `/api/collections/admins/records/${existingAdmin.id}`, {
      name: adminName,
      password: adminPassword,
      passwordConfirm: adminPassword,
      verified: true,
    });
    log.ok(`Updated admin: ${adminEmail}`);
  } else {
    adminRecord = await api('POST', '/api/collections/admins/records', {
      email: adminEmail,
      emailVisibility: true,
      password: adminPassword,
      passwordConfirm: adminPassword,
      name: adminName,
      verified: true,
    });
    log.ok(`Created admin: ${adminEmail}`);
  }

  // --- Demo user ---
  log.step('Seeding demo user');
  const userEmail = process.env.DEMO_USER_EMAIL || 'demo@hallbook.my';
  const userPassword = process.env.DEMO_USER_PASSWORD || 'demo12345';
  const userName = process.env.DEMO_USER_NAME || 'Demo User';
  const existingUser = await findOne('users', `email = "${userEmail}"`);
  let userRecord;
  if (existingUser) {
    userRecord = await api('PATCH', `/api/collections/users/records/${existingUser.id}`, {
      name: userName,
      password: userPassword,
      passwordConfirm: userPassword,
      verified: true,
    });
    log.ok(`Updated user: ${userEmail}`);
  } else {
    userRecord = await api('POST', '/api/collections/users/records', {
      email: userEmail,
      emailVisibility: true,
      password: userPassword,
      passwordConfirm: userPassword,
      name: userName,
      verified: true,
    });
    log.ok(`Created user: ${userEmail}`);
  }

  // --- Sample bookings ---
  log.step('Seeding sample bookings');
  const sampleBookings = [
    {
      venueSlug: 'atrium-klcc',
      dateISO: '2026-05-09', timeStart: '18:00', timeEnd: '23:00',
      dateLabel: 'Sat, May 09', timeLabel: '6:00 PM – 11:00 PM',
      guests: 180, eventType: 'Wedding',
      contactName: userName, contactEmail: userEmail, contactPhone: '+60 12-345 6789',
      notes: 'Round tables for 18. Pelamin on the north wall. Vegetarian menu.',
      status: 'pending', confirm: 'HB-KLCC01', total: 480 * 5,
    },
    {
      venueSlug: 'dewan-seri-selangor',
      dateISO: '2026-04-25', timeStart: '19:00', timeEnd: '23:00',
      dateLabel: 'Fri, Apr 25', timeLabel: '7:00 PM – 11:00 PM',
      guests: 320, eventType: 'Reception',
      contactName: userName, contactEmail: userEmail, contactPhone: '+60 12-345 6789',
      notes: 'Live kompang entry. Buffet for 320.',
      status: 'approved', confirm: 'HB-SEL025', total: 320 * 4,
    },
    {
      venueSlug: 'kuching-riverside-loft',
      dateISO: '2026-03-14', timeStart: '10:00', timeEnd: '16:00',
      dateLabel: 'Sat, Mar 14', timeLabel: '10:00 AM – 4:00 PM',
      guests: 40, eventType: 'Workshop',
      contactName: userName, contactEmail: userEmail, contactPhone: '+60 12-345 6789',
      notes: 'Product photography workshop. Need blackout.',
      status: 'rejected', adminNote: 'Blackout not possible — loft has floor-to-ceiling windows. Suggested alternative: Penang Heritage Hall.',
      confirm: 'HB-KCH014', total: 220 * 6,
    },
  ];
  for (const s of sampleBookings) {
    const venueId = venueIds[s.venueSlug];
    if (!venueId) { log.warn(`Unknown venue ${s.venueSlug}, skipping booking`); continue; }
    const venueName = venuesData.find(v => v.slug === s.venueSlug).name;
    const filter = `user = "${userRecord.id}" && venue = "${venueId}" && dateISO = "${s.dateISO}"`;
    const payload = { ...s, user: userRecord.id, venue: venueId, venueName };
    delete payload.venueSlug;
    const { created } = await upsertRecord('bookings', filter, payload);
    log.ok(`${created ? 'Created' : 'Updated'} booking [${s.status}] ${venueName} on ${s.dateISO}`);
  }

  console.log('\n================ DONE ================');
  console.log(`PocketBase:   ${PB_URL}`);
  console.log(`Admin login:  ${adminEmail} / ${adminPassword}`);
  console.log(`User login:   ${userEmail} / ${userPassword}`);
  console.log('======================================\n');
}

main().catch((e) => {
  log.err(e.message || String(e));
  process.exit(1);
});
