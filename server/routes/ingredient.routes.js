const express = require('express');
const router = express.Router();
const Ingredient = require('../models/ingredient.model');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// @route   GET api/ingredients
// @desc    Get all ingredients
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const ingredients = await Ingredient.find({ user: req.user.id });
    res.json(ingredients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/ingredients/:id
// @desc    Get ingredient by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    
    // Check if ingredient exists
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    
    // Check if user owns the ingredient
    if (ingredient.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    res.json(ingredient);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/ingredients
// @desc    Create a new ingredient
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      purchasePrice, 
      purchaseUnit, 
      recipeUnit, 
      conversionRatio,
      supplier,
      barcode,
      imageUrl,
      inStock,
      stockQuantity,
      wastagePercentage,
      tags,
      notes
    } = req.body;
    
    // Create new ingredient
    const newIngredient = new Ingredient({
      user: req.user.id,
      name,
      description,
      category,
      purchasePrice,
      purchaseUnit,
      recipeUnit,
      conversionRatio,
      supplier,
      barcode,
      imageUrl,
      inStock,
      stockQuantity,
      wastagePercentage,
      tags,
      notes
    });
    
    const ingredient = await newIngredient.save();
    res.json(ingredient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/ingredients/:id
// @desc    Update an ingredient
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    
    // Check if ingredient exists
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    
    // Check if user owns the ingredient
    if (ingredient.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Update ingredient
    const updatedIngredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(updatedIngredient);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/ingredients/:id
// @desc    Delete an ingredient
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    
    // Check if ingredient exists
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    
    // Check if user owns the ingredient
    if (ingredient.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await ingredient.remove();
    res.json({ message: 'Ingredient removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/ingredients/ocr
// @desc    Extract ingredient info from image using OCR
// @access  Private
router.post('/ocr', [auth, upload.single('image')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    const imagePath = path.join(req.file.destination, req.file.filename);
    
    // Use Tesseract.js for OCR
    const { data } = await Tesseract.recognize(imagePath, 'eng');
    
    // Extract text from the image
    const extractedText = data.text;
    
    // Basic parsing logic for price tags (this would need to be enhanced for production)
    const priceMatch = extractedText.match(/\$?\d+\.\d{2}/);
    const price = priceMatch ? parseFloat(priceMatch[0].replace('$', '')) : null;
    
    // Extract product name (simplified approach)
    const lines = extractedText.split('\n').filter(line => line.trim() !== '');
    const productName = lines.length > 0 ? lines[0].trim() : '';
    
    // Clean up the uploaded file
    fs.unlinkSync(imagePath);
    
    res.json({
      success: true,
      extractedText,
      parsedData: {
        name: productName,
        purchasePrice: price
      }
    });
  } catch (err) {
    console.error('OCR error:', err.message);
    res.status(500).send('OCR processing error');
  }
});

// @route   POST api/ingredients/barcode
// @desc    Get ingredient info from barcode
// @access  Private
router.post('/barcode', auth, async (req, res) => {
  try {
    const { barcode } = req.body;
    
    if (!barcode) {
      return res.status(400).json({ message: 'Barcode is required' });
    }
    
    // In a real application, this would connect to a product database API
    // For now, we'll return a mock response
    
    // Check if we already have this barcode in our database
    const existingIngredient = await Ingredient.findOne({ 
      user: req.user.id,
      barcode 
    });
    
    if (existingIngredient) {
      return res.json({
        success: true,
        isExisting: true,
        ingredient: existingIngredient
      });
    }
    
    // Mock response for demonstration purposes
    res.json({
      success: true,
      isExisting: false,
      productData: {
        name: `Product ${barcode.substring(0, 4)}`,
        purchasePrice: parseFloat((Math.random() * 10 + 1).toFixed(2)),
        purchaseUnit: 'kg',
        barcode
      }
    });
  } catch (err) {
    console.error('Barcode processing error:', err.message);
    res.status(500).send('Barcode processing error');
  }
});

// @route   GET api/ingredients/categories
// @desc    Get all ingredient categories
// @access  Private
router.get('/util/categories', auth, async (req, res) => {
  try {
    // Get the enum values from the schema
    const categories = Ingredient.schema.path('category').enumValues;
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/ingredients/low-stock
// @desc    Get ingredients with low stock
// @access  Private
router.get('/util/low-stock', auth, async (req, res) => {
  try {
    // Define what "low stock" means (e.g., less than 5 units)
    const threshold = req.query.threshold || 5;
    
    const lowStockIngredients = await Ingredient.find({ 
      user: req.user.id,
      inStock: true,
      stockQuantity: { $lt: threshold }
    });
    
    res.json(lowStockIngredients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;