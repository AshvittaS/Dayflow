/**
 * Factory: returns middleware that blocks if req.user.role is not in expectedRoles.
 * Usage: router.get('/analytics', auth, requireRole(['admin', 'hr', 'hr_officer']), handler)
 */
export default function requireRole(expectedRoles) {
  const roles = Array.isArray(expectedRoles) ? expectedRoles : [expectedRoles]

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied — required role: ${roles.join(' or ')}.`
      })
    }
    next()
  }
}
