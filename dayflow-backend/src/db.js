import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

// Single connection pool shared across all routes
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               Number(process.env.DB_PORT) || 3306,
  database:           process.env.DB_NAME     || 'dayflow',
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00'
})

// Verify the connection on startup — crash early if misconfigured
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected to', process.env.DB_NAME)
    conn.release()
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message)
    process.exit(1)
  })

export default pool
