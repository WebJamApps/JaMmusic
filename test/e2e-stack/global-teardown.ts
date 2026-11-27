import { createRequire } from 'node:module';
import path from 'node:path';

interface MongooseModule {
  connect(uri: string): Promise<unknown>;
  disconnect(): Promise<void>;
  connection: {
    dropDatabase(): Promise<unknown>;
  };
}

export default async function globalTeardown(): Promise<void> {
  const backendDir = process.env.E2E_STACK_BACKEND_DIR;
  const testDb = process.env.TEST_DB;

  if (!backendDir || !testDb) {
    throw new Error('Missing E2E_STACK_BACKEND_DIR or TEST_DB in global-teardown');
  }

  const parsed = new URL(testDb);
  const dbName = parsed.pathname.replace(/^\/+/, '');
  if (!dbName.startsWith('e2e_stack_') || /release|prod/i.test(dbName)) {
    throw new Error(`Refusing to drop non-stack database "${dbName}"`);
  }

  const requireFromBackend = createRequire(path.join(backendDir, 'package.json'));
  const mongoose = requireFromBackend('mongoose') as MongooseModule;

  await mongoose.connect(testDb);
  try {
    await mongoose.connection.dropDatabase();
  } finally {
    await mongoose.disconnect();
  }
}
