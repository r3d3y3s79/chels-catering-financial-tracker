const express = require('express');
const router = express.Router();
const Purchase = require('../models/purchase.model');
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

// @route   GET api/purchases
// @desc    Get all purchases
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.user.id })
      .sort({ date: -1 })
      .populate('items.ingredient', 'name category');
    res.json(purchases);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/purchases/:id
// @desc    Get purchase by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('items.ingredient', 'name category purchaseUnit recipeUnit conversionRatio');
    
    // Check if purchase exists
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    // Check if user owns the purchase
    if (purchase.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    res.json(purchase);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/purchases
// @desc    Create a new purchase
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { 
      date, 
      supplier, 
      category, 
      items,
      totalAmount,
      paymentMethod,
      receiptImage,
      notes,
      tags
    } = req.body;
    
    // Create new purchase
    const newPurchase = new Purchase({
      user: req.user.id,
      date: date || Date.now(),
      supplier,
      category,
      items: [],
      totalAmount: totalAmount || 0,
      paymentMethod,
      receiptImage,
      notes,
      tags
    });
    
    // Add items if provided
    if (items && items.length > 0) {
      let calculatedTotal = 0;
      
      for (const item of items) {
        newPurchase.items.push(item);
        calculatedTotal += item.price;
        
        // If item has an ingredient ID, update the ingredient's price and stock
        if (item.ingredient) {
          const ingredient = await Ingredient.findById(item.ingredient);
          if (ingredient) {
            // Update purchase price if units match
            if (ingredient.purchaseUnit === item.unit) {
              ingredient.purchasePrice = item.price;
            }
            
            // Update stock quantity
            if (ingredient.purchaseUnit === item.unit) {
              ingredient.stockQuantity += item.quantity;
              ingredient.inStock = ingredient.stockQuantity > 0;
            } else {
              // If units don't match, convert using the conversion ratio
              // This is a simplified approach and would need to be more sophisticated in a real app
              const convertedQuantity = item.quantity * (ingredient.conversionRatio || 1);
              ingredient.stockQuantity += convertedQuantity;
              ingredient.inStock = ingredient.stockQuantity > 0;
            }
            
            await ingredient.save();
          }
        }
      }
      
      // If totalAmount wasn't provided, use the calculated total
      if (!totalAmount) {
        newPurchase.totalAmount = calculatedTotal;
      }
    }
    
    const purchase = await newPurchase.save();
    res.json(purchase);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/purchases/:id
// @desc    Update a purchase
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    // Check if purchase exists
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    // Check if user owns the purchase
    if (purchase.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // If items are provided, recalculate total amount
    if (req.body.items && req.body.items.length > 0 && !req.body.totalAmount) {
      req.body.totalAmount = req.body.items.reduce((total, item) => total + item.price, 0);
    }
    
    // Update purchase
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('items.ingredient', 'name category');
    
    res.json(updatedPurchase);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/purchases/:id
// @desc    Delete a purchase
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    // Check if purchase exists
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    // Check if user owns the purchase
    if (purchase.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Revert ingredient stock changes if needed
    if (purchase.items && purchase.items.length > 0) {
      for (const item of purchase.items) {
        if (item.ingredient) {
          const ingredient = await Ingredient.findById(item.ingredient);
          if (ingredient) {
            // Revert stock quantity changes
            if (ingredient.purchaseUnit === item.unit) {
              ingredient.stockQuantity -= item.quantity;
            } else {
              // If units don't match, convert using the conversion ratio
              const convertedQuantity = item.quantity * (ingredient.conversionRatio || 1);
              ingredient.stockQuantity -= convertedQuantity;
            }
            
            // Ensure stock quantity doesn't go below 0
            ingredient.stockQuantity = Math.max(0, ingredient.stockQuantity);
            ingredient.inStock = ingredient.stockQuantity > 0;
            
            await ingredient.save();
          }
        }
      }
    }
    
    await purchase.remove();
    res.json({ message: 'Purchase removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/purchases/:id/items
// @desc    Add an item to a purchase
// @access  Private
router.post('/:id/items', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    // Check if purchase exists
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    // Check if user owns the purchase
    if (purchase.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    const { ingredient, name, quantity, unit, price, notes } = req.body;
    
    // Create new item
    const newItem = {
      name,
      quantity,
      unit,
      price,
      notes
    };
    
    // If ingredient ID is provided, link to the ingredient
    if (ingredient) {
      newItem.ingredient = ingredient;
      
      // Update the ingredient's price and stock
      const ingredientDoc = await Ingredient.findById(ingredient);
      if (ingredientDoc) {
        // Update purchase price if units match
        if (ingredientDoc.purchaseUnit === unit) {
          ingredientDoc.purchasePrice = price;
        }
        
        // Update stock quantity
        if (ingredientDoc.purchaseUnit === unit) {
          ingredientDoc.stockQuantity += quantity;
        } else {
          // If units don't match, convert using the conversion ratio
          const convertedQuantity = quantity * (ingredientDoc.conversionRatio || 1);
          ingredientDoc.stockQuantity += convertedQuantity;
        }
        
        ingredientDoc.inStock = ingredientDoc.stockQuantity > 0;
        await ingredientDoc.save();
      }
    }
    
    // Add item to purchase
    purchase.items.push(newItem);
    
    // Update total amount
    purchase.totalAmount += price;
    
    await purchase.save();
    res.json(purchase);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/purchases/:id/items/:itemId
// @desc    Update a purchase item
// @access  Private
router.put('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    // Check if purchase exists
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    // Check if user owns the purchase
    if (purchase.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Find the item
    const itemIndex = purchase.items.findIndex(item => item._id.toString() === req.params.itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Get the old price for total amount adjustment
    const oldPrice = purchase.items[itemIndex].price;
    
    // Update item fields
    const { ingredient, name, quantity, unit, price, notes } = req.body;
    
    if (name) purchase.items[itemIndex].name = name;
    if (quantity) purchase.items[itemIndex].quantity = quantity;
    if (unit) purchase.items[itemIndex].unit = unit;
    if (price) purchase.items[itemIndex].price = price;
    if (notes) purchase.items[itemIndex].notes = notes;
    
    // If ingredient ID is provided, update the link
    if (ingredient && (!purchase.items[itemIndex].ingredient || 
        purchase.items[itemIndex].ingredient.toString() !== ingredient)) {
      purchase.items[itemIndex].ingredient = ingredient;
    }
    
    // Update total amount
    if (price) {
      purchase.totalAmount = purchase.totalAmount - oldPrice + price;
    }
    
    await purchase.save();
    res.json(purchase);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Purchase or item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/purchases/:id/items/:itemId
// @desc    Remove an item from a purchase
// @access  Private
router.delete('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    // Check if purchase exists
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    // Check if user owns the purchase
    if (purchase.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Find the item
    const itemIndex = purchase.items.findIndex(item => item._id.toString() === req.params.itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Update total amount
    purchase.totalAmount -= purchase.items[itemIndex].price;
    
    // Remove item
    purchase.items.splice(itemIndex, 1);
    
    await purchase.save();
    res.json(purchase);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Purchase or item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/purchases/receipt
// @desc    Upload and process a receipt image
// @access  Private
router.post('/receipt', [auth, upload.single('image')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    const imagePath = path.join(req.file.destination, req.file.filename);
    
    // Use Tesseract.js for OCR
    const { data } = await Tesseract.recognize(imagePath, 'eng');
    
    // Extract text from the image
    const extractedText = data.text;
    
    // Basic parsing logic for receipts (this would need to be enhanced for production)
    const lines = extractedText.split('\n').filter(line => line.trim() !== '');
    
    // Try to identify the supplier
    const supplierLine = lines.length > 0 ? lines[0].trim() : '';
    
    // Try to identify the date
    let dateMatch = null;
    for (const line of lines) {
      // Look for common date formats (MM/DD/YYYY, DD/MM/YYYY, etc.)
      const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
      const match = line.match(dateRegex);
      if (match) {
        dateMatch = match[1];
        break;
      }
    }
    
    // Try to extract items and prices
    const items = [];
    for (const line of lines) {
      // Look for lines with a price pattern
      const priceMatch = line.match(/\$?\d+\.\d{2}/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[0].replace('$', ''));
        const name = line.replace(priceMatch[0], '').trim();
        
        if (name) {
          items.push({
            name,
            quantity: 1, // Default quantity
            unit: 'item', // Default unit
            price
          });
        }
      }
    }
    
    // Try to extract total amount
    let totalAmount = null;
    for (const line of lines) {
      // Look for lines containing 'total' and a price
      if (line.toLowerCase().includes('total')) {
        const priceMatch = line.match(/\$?\d+\.\d{2}/);
        if (priceMatch) {
          totalAmount = parseFloat(priceMatch[0].replace('$', ''));
          break;
        }
      }
    }
    
    // Clean up the uploaded file
    fs.unlinkSync(imagePath);
    
    res.json({
      success: true,
      extractedText,
      parsedData: {
        supplier: supplierLine,
        date: dateMatch ? new Date(dateMatch) : new Date(),
        items,
        totalAmount: totalAmount || items.reduce((sum, item) => sum + item.price, 0)
      }
    });
  } catch (err) {
    console.error('OCR error:', err.message);
    res.status(500).send('OCR processing error');
  }
});

// @route   GET api/purchases/report/monthly
// @desc    Get monthly purchase report
// @access  Private
router.get('/report/monthly', auth, async (req, res) => {
  try {
    // Get year and month from query params, default to current month
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    
    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Find purchases within the date range
    const purchases = await Purchase.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).populate('items.ingredient', 'name category');
    
    // Calculate total spent
    const totalSpent = purchases.reduce((total, purchase) => total + purchase.totalAmount, 0);
    
    // Group by category
    const categoryTotals = {};
    purchases.forEach(purchase => {
      const category = purchase.category || 'other';
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += purchase.totalAmount;
    });
    
    // Group by supplier
    const supplierTotals = {};
    purchases.forEach(purchase => {
      const supplier = purchase.supplier || 'unknown';
      if (!supplierTotals[supplier]) {
        supplierTotals[supplier] = 0;
      }
      supplierTotals[supplier] += purchase.totalAmount;
    });
    
    // Group by payment method
    const paymentMethodTotals = {};
    purchases.forEach(purchase => {
      const paymentMethod = purchase.paymentMethod || 'other';
      if (!paymentMethodTotals[paymentMethod]) {
        paymentMethodTotals[paymentMethod] = 0;
      }
      paymentMethodTotals[paymentMethod] += purchase.totalAmount;
    });
    
    // Generate daily spending data for chart
    const dailySpending = {};
    purchases.forEach(purchase => {
      const day = new Date(purchase.date).getDate();
      if (!dailySpending[day]) {
        dailySpending[day] = 0;
      }
      dailySpending[day] += purchase.totalAmount;
    });
    
    // Convert to array format for easier consumption by frontend
    const dailySpendingArray = Object.keys(dailySpending).map(day => ({
      day: parseInt(day),
      amount: dailySpending[day]
    })).sort((a, b) => a.day - b.day);
    
    res.json({
      year,
      month,
      totalPurchases: purchases.length,
      totalSpent,
      categoryTotals,
      supplierTotals,
      paymentMethodTotals,
      dailySpending: dailySpendingArray
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/purchases/report/itemized
// @desc    Generate itemized receipt for a purchase
// @access  Private
router.get('/:id/receipt', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('items.ingredient', 'name category')
      .populate('user', 'name company');
    
    // Check if purchase exists
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    // Check if user owns the purchase
    if (purchase.user._id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Format the receipt data
    const receipt = {
      purchaseId: purchase._id,
      date: purchase.date,
      supplier: purchase.supplier,
      company: purchase.user.company,
      items: purchase.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        category: item.ingredient ? item.ingredient.category : 'other'
      })),
      totalAmount: purchase.totalAmount,
      paymentMethod: purchase.paymentMethod,
      notes: purchase.notes
    };
    
    res.json(receipt);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;