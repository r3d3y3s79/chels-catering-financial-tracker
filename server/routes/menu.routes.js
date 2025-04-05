const express = require('express');
const router = express.Router();
const Menu = require('../models/menu.model');
const Recipe = require('../models/recipe.model');
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

// @route   GET api/menus
// @desc    Get all menus
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const menus = await Menu.find({ user: req.user.id })
      .populate('items.recipe', 'name totalCost costPerServing');
    res.json(menus);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/menus/:id
// @desc    Get menu by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id)
      .populate('items.recipe', 'name totalCost costPerServing ingredients instructions');
    
    // Check if menu exists
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    // Check if user owns the menu
    if (menu.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    res.json(menu);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/menus
// @desc    Create a new menu
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      items,
      isActive,
      startDate,
      endDate,
      tags,
      notes
    } = req.body;
    
    // Create new menu
    const newMenu = new Menu({
      user: req.user.id,
      name,
      description,
      category,
      items: [],
      isActive,
      startDate,
      endDate,
      tags,
      notes
    });
    
    // Add items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        // If item has a recipe, get cost from recipe
        if (item.recipe) {
          const recipe = await Recipe.findById(item.recipe);
          if (recipe) {
            item.cost = recipe.totalCost;
            item.profitMargin = recipe.totalCost > 0 ? ((item.price - recipe.totalCost) / item.price) * 100 : 0;
          }
        }
        newMenu.items.push(item);
      }
    }
    
    const menu = await newMenu.save();
    res.json(menu);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/menus/:id
// @desc    Update a menu
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    
    // Check if menu exists
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    // Check if user owns the menu
    if (menu.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // If items are provided, update costs and profit margins
    if (req.body.items && req.body.items.length > 0) {
      for (const item of req.body.items) {
        // If item has a recipe, get cost from recipe
        if (item.recipe) {
          const recipe = await Recipe.findById(item.recipe);
          if (recipe) {
            item.cost = recipe.totalCost;
            item.profitMargin = recipe.totalCost > 0 ? ((item.price - recipe.totalCost) / item.price) * 100 : 0;
          }
        }
      }
    }
    
    // Update menu
    const updatedMenu = await Menu.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('items.recipe', 'name totalCost costPerServing');
    
    res.json(updatedMenu);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/menus/:id
// @desc    Delete a menu
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    
    // Check if menu exists
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    // Check if user owns the menu
    if (menu.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await menu.remove();
    res.json({ message: 'Menu removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/menus/:id/items
// @desc    Add an item to a menu
// @access  Private
router.post('/:id/items', auth, async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    
    // Check if menu exists
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    // Check if user owns the menu
    if (menu.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    const { recipe, name, description, price, imageUrl, tags } = req.body;
    
    // Create new item
    const newItem = {
      name,
      description,
      price,
      imageUrl,
      tags,
      isAvailable: true
    };
    
    // If recipe is provided, get cost from recipe
    if (recipe) {
      newItem.recipe = recipe;
      const recipeDoc = await Recipe.findById(recipe);
      if (recipeDoc) {
        newItem.cost = recipeDoc.totalCost;
        newItem.profitMargin = recipeDoc.totalCost > 0 ? ((price - recipeDoc.totalCost) / price) * 100 : 0;
      }
    }
    
    // Add item to menu
    menu.items.push(newItem);
    await menu.save();
    
    res.json(menu);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/menus/:id/items/:itemId
// @desc    Update a menu item
// @access  Private
router.put('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    
    // Check if menu exists
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    // Check if user owns the menu
    if (menu.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Find the item
    const itemIndex = menu.items.findIndex(item => item._id.toString() === req.params.itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Update item fields
    const { recipe, name, description, price, isAvailable, imageUrl, tags } = req.body;
    
    if (name) menu.items[itemIndex].name = name;
    if (description) menu.items[itemIndex].description = description;
    if (price) menu.items[itemIndex].price = price;
    if (isAvailable !== undefined) menu.items[itemIndex].isAvailable = isAvailable;
    if (imageUrl) menu.items[itemIndex].imageUrl = imageUrl;
    if (tags) menu.items[itemIndex].tags = tags;
    
    // If recipe is provided, update cost and profit margin
    if (recipe) {
      menu.items[itemIndex].recipe = recipe;
      const recipeDoc = await Recipe.findById(recipe);
      if (recipeDoc) {
        menu.items[itemIndex].cost = recipeDoc.totalCost;
        menu.items[itemIndex].profitMargin = recipeDoc.totalCost > 0 ? 
          ((menu.items[itemIndex].price - recipeDoc.totalCost) / menu.items[itemIndex].price) * 100 : 0;
      }
    } else if (price) {
      // If only price is updated, recalculate profit margin
      if (menu.items[itemIndex].cost) {
        menu.items[itemIndex].profitMargin = menu.items[itemIndex].cost > 0 ?
          ((price - menu.items[itemIndex].cost) / price) * 100 : 0;
      }
    }
    
    await menu.save();
    res.json(menu);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Menu or item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/menus/:id/items/:itemId
// @desc    Remove an item from a menu
// @access  Private
router.delete('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    
    // Check if menu exists
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    // Check if user owns the menu
    if (menu.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Find the item
    const itemIndex = menu.items.findIndex(item => item._id.toString() === req.params.itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Remove item
    menu.items.splice(itemIndex, 1);
    await menu.save();
    
    res.json(menu);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Menu or item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/menus/ocr
// @desc    Extract menu info from image using OCR
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
    
    // Basic parsing logic for menu items (this would need to be enhanced for production)
    const lines = extractedText.split('\n').filter(line => line.trim() !== '');
    
    // Simple parsing: assume each line with a price is a menu item
    const menuItems = [];
    
    for (const line of lines) {
      const priceMatch = line.match(/\$?\d+\.\d{2}/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[0].replace('$', ''));
        const name = line.replace(priceMatch[0], '').trim();
        
        if (name) {
          menuItems.push({
            name,
            price,
            isAvailable: true
          });
        }
      }
    }
    
    // Clean up the uploaded file
    fs.unlinkSync(imagePath);
    
    res.json({
      success: true,
      extractedText,
      parsedItems: menuItems
    });
  } catch (err) {
    console.error('OCR error:', err.message);
    res.status(500).send('OCR processing error');
  }
});

// @route   GET api/menus/analysis/profitability
// @desc    Get profitability analysis for all menus
// @access  Private
router.get('/analysis/profitability', auth, async (req, res) => {
  try {
    const menus = await Menu.find({ user: req.user.id })
      .populate('items.recipe', 'name totalCost costPerServing');
    
    // Calculate profitability metrics for each menu
    const menuAnalysis = menus.map(menu => {
      const totalCost = menu.totalCost;
      const totalRevenue = menu.totalRevenue;
      const profit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
      
      // Find most and least profitable items
      let mostProfitableItem = null;
      let leastProfitableItem = null;
      
      if (menu.items.length > 0) {
        // Sort items by profit margin
        const sortedItems = [...menu.items].sort((a, b) => b.profitMargin - a.profitMargin);
        mostProfitableItem = sortedItems[0];
        leastProfitableItem = sortedItems[sortedItems.length - 1];
      }
      
      return {
        _id: menu._id,
        name: menu.name,
        category: menu.category,
        itemCount: menu.items.length,
        totalCost,
        totalRevenue,
        profit,
        profitMargin,
        mostProfitableItem: mostProfitableItem ? {
          name: mostProfitableItem.name,
          price: mostProfitableItem.price,
          cost: mostProfitableItem.cost,
          profitMargin: mostProfitableItem.profitMargin
        } : null,
        leastProfitableItem: leastProfitableItem ? {
          name: leastProfitableItem.name,
          price: leastProfitableItem.price,
          cost: leastProfitableItem.cost,
          profitMargin: leastProfitableItem.profitMargin
        } : null
      };
    });
    
    // Sort by profit margin (highest first)
    menuAnalysis.sort((a, b) => b.profitMargin - a.profitMargin);
    
    res.json(menuAnalysis);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/menus/:id/analysis
// @desc    Get detailed analysis for a specific menu
// @access  Private
router.get('/:id/analysis', auth, async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id)
      .populate('items.recipe', 'name totalCost costPerServing ingredients');
    
    // Check if menu exists
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    // Check if user owns the menu
    if (menu.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Calculate detailed metrics
    const totalCost = menu.totalCost;
    const totalRevenue = menu.totalRevenue;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    
    // Analyze items
    const itemsAnalysis = menu.items.map(item => {
      const itemProfit = item.price - (item.cost || 0);
      const itemProfitMargin = item.price > 0 ? (itemProfit / item.price) * 100 : 0;
      
      return {
        _id: item._id,
        name: item.name,
        price: item.price,
        cost: item.cost || 0,
        profit: itemProfit,
        profitMargin: itemProfitMargin,
        isAvailable: item.isAvailable,
        recipe: item.recipe ? {
          _id: item.recipe._id,
          name: item.recipe.name,
          costPerServing: item.recipe.costPerServing
        } : null
      };
    });
    
    // Sort items by profit margin (highest first)
    itemsAnalysis.sort((a, b) => b.profitMargin - a.profitMargin);
    
    // Calculate what-if scenarios
    const scenarios = {
      increasePrice: {
        percentage: 10,
        newRevenue: totalRevenue * 1.1,
        newProfit: (totalRevenue * 1.1) - totalCost,
        newProfitMargin: totalRevenue > 0 ? (((totalRevenue * 1.1) - totalCost) / (totalRevenue * 1.1)) * 100 : 0
      },
      decreasePrice: {
        percentage: 10,
        newRevenue: totalRevenue * 0.9,
        newProfit: (totalRevenue * 0.9) - totalCost,
        newProfitMargin: totalRevenue > 0 ? (((totalRevenue * 0.9) - totalCost) / (totalRevenue * 0.9)) * 100 : 0
      },
      decreaseCost: {
        percentage: 10,
        newCost: totalCost * 0.9,
        newProfit: totalRevenue - (totalCost * 0.9),
        newProfitMargin: totalRevenue > 0 ? ((totalRevenue - (totalCost * 0.9)) / totalRevenue) * 100 : 0
      }
    };
    
    res.json({
      _id: menu._id,
      name: menu.name,
      category: menu.category,
      itemCount: menu.items.length,
      totalCost,
      totalRevenue,
      profit,
      profitMargin,
      items: itemsAnalysis,
      scenarios
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;