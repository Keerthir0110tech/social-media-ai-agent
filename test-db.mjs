import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL, { prepare: false });
try {
    console.log("Connected. Users:", await sql`select count(*) from users`);
    console.log("Campaigns:", await sql`select count(*) from campaigns`);
} catch (e) {
    console.log("ERROR:", e.message);
}
process.exit();