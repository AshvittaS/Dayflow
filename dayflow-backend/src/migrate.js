import pool from './db.js'

async function migrate() {
  const conn = await pool.getConnection()
  try {
    const cols = [
      'ALTER TABLE employees ADD COLUMN title VARCHAR(100) NULL AFTER department',
      'ALTER TABLE employees ADD COLUMN location VARCHAR(100) NULL DEFAULT "Bengaluru" AFTER title',
      'ALTER TABLE employees ADD COLUMN date_of_birth DATE NULL AFTER about',
      'ALTER TABLE employees ADD COLUMN gender VARCHAR(50) NULL AFTER date_of_birth',
      'ALTER TABLE employees ADD COLUMN address TEXT NULL AFTER gender',
      `CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        company_id INT NOT NULL,
        user_id INT NULL,
        role_target VARCHAR(20) NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'system',
        title VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(255) NULL,
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`
    ]
    for (const sql of cols) {
      try {
        await conn.query(sql)
        console.log('Successfully executed:', sql)
      } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
          console.log('Column already exists.')
        } else {
          console.log('Notice:', e.message)
        }
      }
    }
    console.log('Migration completed!')
  } finally {
    conn.release()
    process.exit(0)
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
