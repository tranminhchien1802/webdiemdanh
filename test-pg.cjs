const { Client } = require("pg");
const url = "postgresql://neondb_owner:npg_BZXHo0gCn2lJ@ep-wild-waterfall-avdj0mmf.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require";
const t0 = Date.now();
const c = new Client({ connectionString: url, connectionTimeoutMillis: 20000 });
c.connect().then(() => c.query("SELECT pg_advisory_lock(72707369), pg_advisory_unlock(72707369)")).then(() => {
  console.log("OK - connect+" + (Date.now()-t0) + "ms, advisory lock OK");
  return c.end();
}).catch(e => { console.log("FAIL +" + (Date.now()-t0) + "ms:", e.message); try { c.end(); } catch{} });
