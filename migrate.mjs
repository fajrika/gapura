import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL belum di-set");
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
try {
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  console.log("Migrasi database selesai.");
} catch (err) {
  console.error("Migrasi gagal:", err);
  process.exitCode = 1;
} finally {
  await client.end();
}
