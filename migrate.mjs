import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1, onnotice: () => { } });
const dir = "migrations";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

for (const f of files) {
    const text = fs.readFileSync(path.join(dir, f), "utf8");
    try {
        await sql.begin(async (tx) => { await tx.unsafe(text); });
        console.log("OK     ", f);
    } catch (e) {
        if (/already exists/i.test(e.message)) {
            console.log("SKIP   ", f, "-", e.message);
        } else {
            console.log("FAILED ", f, "-", e.message);
            break;
        }
    }
}

const tables = await sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name`;
console.log("\nTables now:", tables.map((t) => t.table_name).join(", "));
await sql.end();