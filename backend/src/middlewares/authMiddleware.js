import jwt from 'jsonwebtoken';
import Doctor from '../models/Doctor.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.doctor = await Doctor.findById(decoded.id).select('-password');
      return next();
    } catch {
      return res.status(401).json({ message: 'Not authorized' });
    }
  }
  res.status(401).json({ message: 'No token provided' });
};
