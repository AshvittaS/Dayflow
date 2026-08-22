/**
 * runSchema.js — Creates the DB and all tables from schema.sql
 * Run ONCE before seeding: node src/runSchema.js
 */
import 'dotenv/config'
import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function run() {
  // Connect without specifying a database first (so we can CREATE it)
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  })

  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  try {
    await conn.query(sql)
    console.log('✅ Schema created / verified.')
  } catch (err) {
    console.error('❌ Schema error:', err.message)
    process.exit(1)
  } finally {
    await conn.end()
  }
}

run()
