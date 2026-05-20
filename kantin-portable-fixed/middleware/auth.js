const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'kantin-local-secret';

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token bulunamadı' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token geçersiz' });
  }
};
