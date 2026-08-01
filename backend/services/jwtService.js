const jwt = require('jsonwebtoken');

const generateToken = (id, role = 'citizen') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'crimegpt_super_jwt_secret_key_2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'crimegpt_super_jwt_secret_key_2026');
};

module.exports = { generateToken, verifyToken };
