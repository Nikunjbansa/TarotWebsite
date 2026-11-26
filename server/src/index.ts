import { env } from './config/env';
import { getDb } from './db/database';
import { seedDatabase } from './db/seed';
import { createApp } from './app';

async function bootstrap() {
  const db = getDb();
  await seedDatabase(db);

  const app = createApp();
  app.listen(env.port, () => {
    console.log(
      `Akansha.Predicts server listening on http://localhost:${env.port}`
    );
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

