


import jwt from "jsonwebtoken";
import User from "../models/user.js";





export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // টোকেন নিন
      token = req.headers.authorization.split(' ')[1];
      
      // টোকেন আছে কিনা চেক করুন
      if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({ message: 'Not authorized, no token' });
      }

      console.log('🔍 Token received:', token.substring(0, 15) + '...');

      // টোকেন ভেরিফাই করুন
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user ID:', decoded.id);

      // ইউজার খুঁজে বের করুন
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.log('❌ User not found for ID:', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('✅ User authenticated:', req.user.email);
      next();
    } catch (error) {
      console.error('❌ Auth error:', error.message);
      
      // নির্দিষ্ট error message দিন
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token format' });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      } else {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
    }
  } else {
    console.log('❌ No Bearer token found');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};


// ================= ADMIN CHECK =================
export const admin = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  } else {
    return res.status(403).json({ message: "Admin only" });
  }
};

// ================= ROLE-BASED CHECK (OPTIONAL) =================
export const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  };
};