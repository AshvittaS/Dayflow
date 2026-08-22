import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

const isRemoteOrSsl =
  process.env.DB_SSL === 'true' ||
  (process.env.DB_HOST && !['localhost', '127.0.0.1'].includes(process.env.DB_HOST))

const poolConfig = process.env.DATABASE_URL
  ? {
      uri: process.env.DATABASE_URL,
      ssl: isRemoteOrSsl ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '+00:00'
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      database: process.env.DB_NAME || 'dayflow',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      ssl: isRemoteOrSsl ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '+00:00'
    }

const pool = mysql.createPool(poolConfig)

// Verify the connection on startup — crash early if misconfigured
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL/TiDB connected to', process.env.DB_NAME || 'database')
    conn.release()
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message)
    process.exit(1)
  })

export default pool
