const mariadb = require('mariadb');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { PrismaClient } = require('@prisma/client');

console.log("DATABASE_URL:", process.env.DATABASE_URL);

// According to Mariadb docs, you might need to parse the URL or pass it directly.
// But we can try creating a pool with just the URI if it's supported.
// Or we parse it with a URL parser.
const url = new URL(process.env.DATABASE_URL);
const pool = mariadb.createPool({
  host: url.hostname,
  port: url.port ? parseInt(url.port) : 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.substring(1), // remove leading slash
  connectionLimit: 5
});

const adapter = new PrismaMariaDb(pool);

try {
  const prisma = new PrismaClient({ adapter });
  console.log("Success! Prisma Client instantiated with Mariadb adapter.");
  
  // Test query
  prisma.user.findFirst().then(() => {
    console.log("Query success!");
    process.exit(0);
  }).catch(e => {
    console.error("Query failed:", e);
    process.exit(1);
  });
} catch (e) {
  console.error("Error instantiating Prisma Client:", e);
  process.exit(1);
}
