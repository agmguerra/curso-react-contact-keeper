const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const authFilter = require('../middleware/authFilter');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');

const router = express.Router();

// @route     POST api/auth
// @desc      Auth user and get token
// @access    Public  
router.post('/', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
],
async (req, res) => {
  console.log(req.body);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id
      }
    }

    jwt.sign(payload, config.get('jwtSecret'), {
      expiresIn: 360000
    }, (err, token) => {
      if (err) throw err;
      
      res.json({ token });
    });

  } catch (error) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

// @route     GET api/auth
// @desc      Get logged user
// @access    Private  
router.get('/', authFilter, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;