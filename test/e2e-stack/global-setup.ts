import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

interface InsertResult {
  insertedId: { toString(): string };
}

interface MongoCollection {
  insertOne(doc: Record<string, unknown>): Promise<InsertResult>;
}

interface MongooseModule {
  connect(uri: string): Promise<unknown>;
  disconnect(): Promise<void>;
  connection: {
    collection(name: string): MongoCollection;
  };
}

interface AuthUtilsModule {
  default: {
    createJWT(user: { _id: string }): string;
  };
}

export interface StackAuthFixture {
  admin: {
    token: string;
    user: {
      _id: string;
      name: string;
      email: string;
      userType: string;
      privileges: string[];
    };
  };
  nonAdmin: {
    token: string;
    user: {
      _id: string;
      name: string;
      email: string;
      userType: string;
      privileges: string[];
    };
  };
  venues: {
    active: { _id: string; name: string };
    archived: { _id: string; name: string };
  };
}

function assertSafeStackDb(rawUri: string): string {
  const parsed = new URL(rawUri);
  const dbName = parsed.pathname.replace(/^\/+/, '');
  if (!dbName.startsWith('e2e_stack_') || /release|prod/i.test(dbName)) {
    throw new Error(`Refusing global-setup on unsafe database "${dbName}"`);
  }
  return dbName;
}

export default async function globalSetup(): Promise<void> {
  const backendDir = process.env.E2E_STACK_BACKEND_DIR;
  const testDb = process.env.TEST_DB;
  const authFile = process.env.E2E_STACK_AUTH_FILE;
  const hashString = process.env.E2E_STACK_HASH_STRING || process.env.HashString;

  if (!backendDir || !testDb || !authFile || !hashString) {
    throw new Error(
      'Missing required E2E stack env vars (E2E_STACK_BACKEND_DIR, TEST_DB, E2E_STACK_AUTH_FILE, E2E_STACK_HASH_STRING)',
    );
  }

  assertSafeStackDb(testDb);
  process.env.HashString = hashString;

  const requireFromBackend = createRequire(path.join(backendDir, 'package.json'));
  const mongoose = requireFromBackend('mongoose') as MongooseModule;
  const authUtilsPath = path.join(backendDir, 'build/src/auth/authUtils.js');
  const authUtils = (await import(pathToFileURL(authUtilsPath).href) as AuthUtilsModule).default;

  await mongoose.connect(testDb);
  try {
    const usersColl = mongoose.connection.collection('users');
    const venuesColl = mongoose.connection.collection('venues');
    const gigsColl = mongoose.connection.collection('gigs');

    const adminUser = {
      name: 'E2E Stack Admin',
      email: 'e2e-stack-admin@web-jam.com',
      verifiedEmail: true,
      userType: 'Developer',
      privileges: ['gig:create', 'venue:create', 'venue:edit', 'venue:delete'],
    };
    const adminInsert = await usersColl.insertOne(adminUser);
    const adminId = adminInsert.insertedId.toString();

    // Seed a non-privileged gig writer: holds venue:create (so CreateGigDialog can open
    // and list venues after AuthProvider's /user/:id refresh) but lacks gig:create,
    // causing WebJamSocketCluster verifyAdminWrite -> assertCanCreateGig to emit socketError.
    const nonAdminUser = {
      name: 'E2E Stack Non-Gig User',
      email: 'e2e-stack-nongig@web-jam.com',
      verifiedEmail: true,
      userType: 'Developer',
      privileges: ['venue:create'],
    };
    const nonAdminInsert = await usersColl.insertOne(nonAdminUser);
    const nonAdminId = nonAdminInsert.insertedId.toString();

    const now = new Date();
    const activeVenueDoc = {
      name: 'Stack Seeded Active Venue',
      address: '100 Main St',
      city: 'Salem',
      usState: 'VA',
      zipCode: '24153',
      country: 'US',
      venueType: 'PubFestivalBrewery',
      contactName: 'Seeded Contact',
      email: 'seeded-active@example.com',
      status: 'active',
      outreachEligible: true,
      gigInterval: 0,
      payAmount: 0.01,
      personalFavorite: false,
      familyNearby: true,
      familyNearbyOverride: false,
      touches: [],
      created_at: now,
      updated_at: now,
    };
    const archivedVenueDoc = {
      name: 'Stack Seeded Archived Venue',
      address: '200 Elm St',
      city: 'Roanoke',
      usState: 'VA',
      zipCode: '24011',
      country: 'US',
      venueType: 'MidRangeCafeBar',
      contactName: 'Archived Contact',
      email: 'seeded-archived@example.com',
      status: 'archived',
      outreachEligible: false,
      gigInterval: 0,
      payAmount: 0.01,
      personalFavorite: false,
      familyNearby: true,
      familyNearbyOverride: false,
      touches: [],
      created_at: now,
      updated_at: now,
    };

    const activeVenueInsert = await venuesColl.insertOne(activeVenueDoc);
    const archivedVenueInsert = await venuesColl.insertOne(archivedVenueDoc);
    const activeVenueId = activeVenueInsert.insertedId;
    const archivedVenueId = archivedVenueInsert.insertedId;

    const baselineFuture = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    await gigsColl.insertOne({
      datetime: baselineFuture,
      venue: 'Seeded Baseline Gig',
      tickets: 'Free',
      duration: 2,
      artist: 'jammusic',
      venueId: activeVenueId,
      created_at: now,
      updated_at: now,
    });

    const adminToken = authUtils.createJWT({ _id: adminId });
    const nonAdminToken = authUtils.createJWT({ _id: nonAdminId });

    const fixture: StackAuthFixture = {
      admin: {
        token: adminToken,
        user: {
          _id: adminId,
          name: adminUser.name,
          email: adminUser.email,
          userType: adminUser.userType,
          privileges: adminUser.privileges,
        },
      },
      nonAdmin: {
        token: nonAdminToken,
        user: {
          _id: nonAdminId,
          name: nonAdminUser.name,
          email: nonAdminUser.email,
          userType: nonAdminUser.userType,
          privileges: nonAdminUser.privileges,
        },
      },
      venues: {
        active: { _id: activeVenueId.toString(), name: activeVenueDoc.name },
        archived: { _id: archivedVenueId.toString(), name: archivedVenueDoc.name },
      },
    };

    fs.mkdirSync(path.dirname(authFile), { recursive: true });
    fs.writeFileSync(authFile, JSON.stringify(fixture, null, 2), 'utf8');
  } finally {
    await mongoose.disconnect();
  }
}
