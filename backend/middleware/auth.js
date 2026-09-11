// Authentication middleware & token helper utilities
import jwt from 'jsonwebtoken';

const getJwtSecret = () => process.env.JWT_SECRET || 'friendai_super_secret_jwt_key_2025';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, getJwtSecret(), (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
    }
    
    // Normalize id field so all routes can safely use req.user.id
    const userId = decoded.userId || decoded.id || decoded._id;
    req.user = {
      ...decoded,
      id: userId,
      userId: userId
    };
    next();
  });
};

export const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, id: userId, email },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};
