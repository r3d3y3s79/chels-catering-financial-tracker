const express = require('express');
const router = express.Router();
const Supermarket = require('../models/supermarket.model');
const auth = require('../middleware/auth');

// @route   GET api/supermarkets
// @desc    Get all supermarkets
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const supermarkets = await Supermarket.find().sort({ name: 1 });
    res.json(supermarkets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/supermarkets/:id
// @desc    Get supermarket by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const supermarket = await Supermarket.findById(req.params.id);
    
    if (!supermarket) {
      return res.status(404).json({ message: 'Supermarket not found' });
    }
    
    res.json(supermarket);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Supermarket not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/supermarkets
// @desc    Create a new supermarket
// @access  Private (Admin only in a real app)
router.post('/', auth, async (req, res) => {
  try {
    // In a real app, check if the user is an admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }
    
    const { name, logoUrl, websiteUrl, scrapingEnabled, scrapingUrls } = req.body;
    
    // Check if supermarket already exists
    let supermarket = await Supermarket.findOne({ name });
    if (supermarket) {
      return res.status(400).json({ message: 'Supermarket already exists' });
    }
    
    // Create new supermarket
    supermarket = new Supermarket({
      name,
      logoUrl,
      websiteUrl,
      scrapingEnabled: scrapingEnabled || false,
      scrapingUrls
    });
    
    await supermarket.save();
    res.json(supermarket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/supermarkets/:id
// @desc    Update a supermarket
// @access  Private (Admin only in a real app)
router.put('/:id', auth, async (req, res) => {
  try {
    // In a real app, check if the user is an admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }
    
    const supermarket = await Supermarket.findById(req.params.id);
    
    if (!supermarket) {
      return res.status(404).json({ message: 'Supermarket not found' });
    }
    
    // Update supermarket
    const updatedSupermarket = await Supermarket.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(updatedSupermarket);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Supermarket not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/supermarkets/:id
// @desc    Delete a supermarket
// @access  Private (Admin only in a real app)
router.delete('/:id', auth, async (req, res) => {
  try {
    // In a real app, check if the user is an admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }
    
    const supermarket = await Supermarket.findById(req.params.id);
    
    if (!supermarket) {
      return res.status(404).json({ message: 'Supermarket not found' });
    }
    
    await supermarket.remove();
    res.json({ message: 'Supermarket removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Supermarket not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/supermarkets/:id/price-history/:ingredientId
// @desc    Get price history for an ingredient from a specific supermarket
// @access  Private
router.get('/:id/price-history/:ingredientId', auth, async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.ingredientId);
    
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    
    // Filter price history for the specific supermarket
    const priceHistory = ingredient.priceHistory.filter(
      history => history.supermarket.toString() === req.params.id
    ).sort((a, b) => b.date - a.date); // Sort by date descending
    
    res.json(priceHistory);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Ingredient or supermarket not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
