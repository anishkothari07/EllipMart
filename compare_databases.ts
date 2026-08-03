import 'dotenv/config';
import * as mysql from 'mysql2/promise';

async function main() {
    const railwayUrl = process.env.DATABASE_URL;
    const localUrl = "mysql://root:@localhost:3306/smartgo";

    if (!railwayUrl) throw new Error("No DATABASE_URL set");

    let railwayConn;
    try {
        railwayConn = await mysql.createConnection(railwayUrl);
    } catch (e) {
        console.error("Failed to connect to Railway DB", e);
    }

    let localConn;
    try {
        localConn = await mysql.createConnection(localUrl);
    } catch (e) {
        console.error("Failed to connect to Local DB. It might not be running.");
    }

    const tables = [
        'User', 'Product', 'Category', 'Collection', 'Brand',
        'Inventory', 'InventoryMovement', 'ProductImage', 'Media',
        'Order', 'OrderItem', 'Cart', 'CartItem', 'Wishlist',
        'Review', 'Notification', 'Address', 'Payment', 'Shipment',
        'Website', 'WebsitePage', 'WebsiteSection'
    ];

    console.log("=== Row Counts ===");
    console.log("Table | Local | Railway");
    
    for (const table of tables) {
        let localCount = 'ERROR';
        if (localConn) {
            try {
                const [rows] = await localConn.query(`SELECT COUNT(*) as c FROM ${table}`);
                localCount = (rows as any)[0].c;
            } catch (e) { localCount = '0'; } // table might not exist or empty
        }

        let railwayCount = 'ERROR';
        if (railwayConn) {
            try {
                const [rows] = await railwayConn.query(`SELECT COUNT(*) as c FROM ${table}`);
                railwayCount = (rows as any)[0].c;
            } catch (e) { railwayCount = '0'; }
        }

        console.log(`${table} | ${localCount} | ${railwayCount}`);
    }

    if (localConn) await localConn.end();
    if (railwayConn) await railwayConn.end();
}

main().catch(console.error);
