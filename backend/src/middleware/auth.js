import jwt from 'jsonwebtoken';

/**
 * Express middleware that verifies a JWT from the Authorization header.
 * Attaches `req.user = { id, email }` on success.
 * Sends 401 if missing or invalid.
 */
export function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = header.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.id, email: payload.email };
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Optional auth — attaches user if token present, otherwise continues.
 */
export function optionalAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
        try {
            const token = header.split(' ')[1];
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { id: payload.id, email: payload.email };
        } catch {
            // token invalid, proceed without user
        }
    }
    next();
}
