/**
 * Factory: returns middleware that blocks if req.user.role !== expectedRole.
 * Usage: router.get('/salary', auth, requireRole('admin'), handler)
 *
 * § Cross-cutting invariant (SKILL.md §8):
 * - Employee can never see Salary Info or another employee's data.
 * - Only Admin/HR can approve/reject leave or edit salary structure.
 */
export default function requireRole(expectedRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' })
    }
    if (req.user.role !== expectedRole) {
      return res.status(403).json({
        error: `Access denied — ${expectedRole} role required.`
      })
    }
    next()
  }
}
