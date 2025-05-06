import mysql from "mysql2/promise";

let pool;

async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "localhost",
      port: parseInt(process.env.MYSQL_PORT || "3306"),
      database: process.env.MYSQL_DATABASE || "monitoramento_florestal",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function query({ query, values = [] }) {
  try {
    const pool = await getPool();
    const [results] = await pool.query(query, values);
    return results;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

export default { query };
