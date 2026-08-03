import 'dotenv/config';
import { prisma } from './packages/database/src/index';

async function main() {
    try {
        const tables = await prisma.$queryRaw`SHOW TABLES;`;
        console.log(`Number of tables created: ${(tables as any[]).length}`);
        
        console.log("First 10 table names:");
        (tables as any[]).slice(0, 10).forEach((t, i) => {
            console.log(`${i + 1}. ${Object.values(t)[0]}`);
        });
    } catch (e) {
        console.error("Error querying tables:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
