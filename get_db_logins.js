const { connectDB, getPool } = require("./configs/database.config");
require("dotenv").config();

const run = async () => {
  try {
    await connectDB();
    const pool = getPool();
    
    // Query server logins
    const logins = await pool.request().query(`
      SELECT name, type_desc, create_date FROM sys.server_principals 
      WHERE type_desc IN ('SQL_LOGIN') AND name NOT LIKE '##%'
    `);
    console.log("=== SQL LOGINS IN CONTAINER ===");
    console.log(JSON.stringify(logins.recordset, null, 2));

    // Query database users
    const users = await pool.request().query(`
      SELECT name, type_desc, create_date FROM sys.database_principals
      WHERE type_desc IN ('SQL_USER') AND name NOT LIKE '##%' AND name NOT IN ('dbo', 'guest', 'INFORMATION_SCHEMA', 'sys')
    `);
    console.log("\n=== DATABASE USERS IN CONTAINER ===");
    console.log(JSON.stringify(users.recordset, null, 2));

    // Query mapping from TAIKHOAN
    const accounts = await pool.request().query(`
      SELECT ID, USERNAME, ROLE, MAGV FROM TAIKHOAN
    `);
    console.log("\n=== TAIKHOAN TABLE ===");
    console.log(JSON.stringify(accounts.recordset, null, 2));

    process.exit(0);
  } catch (e) {
    console.error("Loi:", e);
    process.exit(1);
  }
};

run();
