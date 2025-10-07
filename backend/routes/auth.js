const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if(!name || !email || !password) return res.status(400).json({ message: 'Please enter all fields' });
    let user = await User.findOne({ email });
    if(user) return res.status(400).json({ message: 'User already exists' });
    user = new User({ name, email, password: await bcrypt.hash(password, 10) });
    await user.save();
    const payload = { user: { id: user._id } };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
      if(err) throw err;
      res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ message: 'Please enter all fields' });
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const payload = { user: { id: user._id } };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
      if(err) throw err;
      res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get current user
const auth = require('../middleware/auth');
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;
