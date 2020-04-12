const express = require('express');
const authFilter = require('../middleware/authFilter');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');
const Contact = require('../models/Contact');

const router = express.Router();

// @route     GET api/contacts
// @desc      Get all users contacts
// @access    Private   
router.get('/', authFilter, async (req, res) => {
  try {
    //obtem os contatos de um usuário ordenados pelo mais recente
    const contacts = await Contact.find({ user: req.user.id }).sort({ data: -1 });
    res.json(contacts);
  } catch (error) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
  
});

// @route     POST api/contacts
// @desc      Add new contact
// @access    Private   
router.post(
  '/', 
  [
    authFilter, 
    [
      check('name', 'Name os required').not().isEmpty()
    ]
  ], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, type } = req.body;

    try {
      const newContact = new Contact({
        name,
        email,
        phone,
        type,
        user: req.user.id
      })

      const contact = await newContact.save();

      res.json(contact);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route     PUT api/contacts/:id
// @desc      Update contact
// @access    Private   
router.put('/:id', authFilter, async (req, res) => {

  const { name, email, phone, type } = req.body;

  //Build contact object
  const contactFields = {};
  if (name) contactFields.name = name;
  if (name) contactFields.email = email;
  if (name) contactFields.phone = phone;
  if (name) contactFields.type = type;

  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: 'Contact not found'});

    // Make sure user owns contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized'});
    }

    contact = await Contact.findByIdAndUpdate(req.params.id, 
      { $set: contactFields },
      { new: true });

    res.json(contact);

  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route     DELETE api/contacts/:id
// @desc      Delete contact
// @access    Private   
router.delete('/:id', authFilter, async (req, res) => {

  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: 'Contact not found'});

    // Make sure user owns contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized'});
    }

    await Contact.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Contact Removed'});

  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;