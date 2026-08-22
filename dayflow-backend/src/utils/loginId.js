/**
 * Generates the system login ID for a new employee.
 * Format: [CompanyCode][2-digit year][Initials][4-digit serial]
 * Example: DF26JD0001 (Dayflow, 2026, Jamie Doe, serial #1 for that year)
 *
 * NOTE (SKILL.md §9): The exact algorithm is not fully specified in the wireframe.
 * This implementation matches the example `DF23JD0001` in mockData.
 * If the team confirms a different scheme, this is the single function to update.
 *
 * @param {string} companyCode - e.g. 'DF'
 * @param {string} firstName   - e.g. 'Jamie'
 * @param {string} lastName    - e.g. 'Doe'
 * @param {number} joinYear    - e.g. 2026
 * @param {number} serial      - 1-based serial for this company+year, e.g. 1
 * @returns {string}           - e.g. 'DF26JD0001'
 */
export function generateLoginId(companyCode, firstName, lastName, joinYear, serial) {
  const code    = companyCode.toUpperCase().slice(0, 4)
  const year    = String(joinYear).slice(-2)          // last 2 digits of year
  const initials= (firstName[0] + lastName[0]).toUpperCase()
  const seq     = String(serial).padStart(4, '0')
  return `${code}${year}${initials}${seq}`
}

/**
 * Queries the DB for the next available serial number for
 * (companyId, joinYear) and returns the generated login_id.
 *
 * @param {import('mysql2/promise').Pool} pool
 * @param {string} companyCode
 * @param {string} firstName
 * @param {string} lastName
 * @param {number} joinYear
 * @param {number} companyId
 * @returns {Promise<string>}
 */
export async function nextLoginId(pool, companyCode, firstName, lastName, joinYear, companyId) {
  // Count existing users in this company who joined in joinYear to get the next serial
  const [[{ count }]] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM users u
     JOIN employees e ON e.user_id = u.id
     WHERE u.company_id = ?
       AND YEAR(e.join_date) = ?`,
    [companyId, joinYear]
  )
  const serial = Number(count) + 1
  return generateLoginId(companyCode, firstName, lastName, joinYear, serial)
}
