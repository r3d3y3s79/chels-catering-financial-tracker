const express = require('express');
const router = express.Router();
const ShoppingList = require('../models/shoppingList.model');
const SupermarketProduct = require('../models/supermarketProduct.model');
const Ingredient = require('../models/ingredient.model');
const auth = require('../middleware/auth');

// @route   GET api/shopping-lists
// @desc    Get all user's shopping lists
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const shoppingLists = await ShoppingList.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('primarySupermarket', 'name');
    
    res.json(shoppingLists);
  } catch (err) {
    console.error('Error fetching shopping lists:', err);
    res.status(500).send('Server error');
  }
});

// @route   GET api/shopping-lists/:id
// @desc    Get shopping list by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id)
      .populate('primarySupermarket', 'name logoUrl')
      .populate({
        path: 'items.supermarket',
        select: 'name'
      });
    
    // Check if shopping list exists
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    // Check if user owns the shopping list
    if (shoppingList.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    res.json(shoppingList);
  } catch (err) {
    console.error('Error fetching shopping list:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/shopping-lists/active
// @desc    Get user's active shopping list
// @access  Private
router.get('/status/active', auth, async (req, res) => {
  try {
    const activeList = await ShoppingList.findOne({ 
      user: req.user.id,
      isActive: true 
    })
    .populate('primarySupermarket', 'name logoUrl')
    .populate({
      path: 'items.supermarket',
      select: 'name'
    });
    
    if (!activeList) {
      return res.json(null);
    }
    
    res.json(activeList);
  } catch (err) {
    console.error('Error fetching active shopping list:', err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/shopping-lists
// @desc    Create a new shopping list
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, primarySupermarket, plannedPurchaseDate } = req.body;
    
    // Create new shopping list
    const newShoppingList = new ShoppingList({
      user: req.user.id,
      name,
      description,
      primarySupermarket,
      plannedPurchaseDate,
      items: [],
      isActive: true
    });
    
    const shoppingList = await newShoppingList.save();
    res.json(shoppingList);
  } catch (err) {
    console.error('Error creating shopping list:', err);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/shopping-lists/:id
// @desc    Update a shopping list
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id);
    
    // Check if shopping list exists
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    // Check if user owns the shopping list
    if (shoppingList.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Don't allow direct update of items array here
    const { name, description, primarySupermarket, plannedPurchaseDate, isActive, completedDate } = req.body;
    
    const listFields = {};
    if (name) listFields.name = name;
    if (description !== undefined) listFields.description = description;
    if (primarySupermarket) listFields.primarySupermarket = primarySupermarket;
    if (plannedPurchaseDate) listFields.plannedPurchaseDate = plannedPurchaseDate;
    if (isActive !== undefined) listFields.isActive = isActive;
    if (completedDate) listFields.completedDate = completedDate;
    
    // Update shopping list
    const updatedList = await ShoppingList.findByIdAndUpdate(
      req.params.id,
      { $set: listFields },
      { new: true }
    ).populate('primarySupermarket', 'name');
    
    res.json(updatedList);
  } catch (err) {
    console.error('Error updating shopping list:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/shopping-lists/:id/items
// @desc    Add an item to a shopping list
// @access  Private
router.post('/:id/items', auth, async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id);
    
    // Check if shopping list exists
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    // Check if user owns the shopping list
    if (shoppingList.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    const { product, ingredient, name, quantity, unit, price, supermarket, notes } = req.body;
    
    // Create new item
    const newItem = {
      product,
      ingredient,
      name,
      quantity,
      unit,
      price,
      supermarket,
      notes,
      isChecked: false
    };
    
    // Add to items array
    shoppingList.items.push(newItem);
    
    // Save shopping list
    await shoppingList.save();
    
    res.json(shoppingList);
  } catch (err) {
    console.error('Error adding item to shopping list:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/shopping-lists/:id/items/:itemId
// @desc    Update an item in a shopping list
// @access  Private
router.put('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id);
    
    // Check if shopping list exists
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    // Check if user owns the shopping list
    if (shoppingList.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Find the item
    const itemIndex = shoppingList.items.findIndex(item => item._id.toString() === req.params.itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Update the item with new values
    const { quantity, notes, isChecked } = req.body;
    
    if (quantity !== undefined) shoppingList.items[itemIndex].quantity = quantity;
    if (notes !== undefined) shoppingList.items[itemIndex].notes = notes;
    if (isChecked !== undefined) shoppingList.items[itemIndex].isChecked = isChecked;
    
    // Save shopping list
    await shoppingList.save();
    
    res.json(shoppingList);
  } catch (err) {
    console.error('Error updating shopping list item:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Shopping list or item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/shopping-lists/:id/items/:itemId
// @desc    Remove an item from a shopping list
// @access  Private
router.delete('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id);
    
    // Check if shopping list exists
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    // Check if user owns the shopping list
    if (shoppingList.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Find the item
    const itemIndex = shoppingList.items.findIndex(item => item._id.toString() === req.params.itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Remove the item
    shoppingList.items.splice(itemIndex, 1);
    
    // Save shopping list
    await shoppingList.save();
    
    res.json(shoppingList);
  } catch (err) {
    console.error('Error removing item from shopping list:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Shopping list or item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/shopping-lists/:id/add-product/:productId
// @desc    Add a supermarket product to a shopping list
// @access  Private
router.post('/:id/add-product/:productId', auth, async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id);
    
    // Check if shopping list exists
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    // Check if user owns the shopping list
    if (shoppingList.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Get the product
    const product = await SupermarketProduct.findById(req.params.productId)
      .populate('supermarket', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product already in list
    const existingItemIndex = shoppingList.items.findIndex(
      item => item.product && item.product.toString() === req.params.productId
    );
    
    if (existingItemIndex !== -1) {
      // Update quantity instead of adding new item
      const quantity = req.body.quantity || 1;
      shoppingList.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem = {
        product: product._id,
        name: product.name,
        quantity: req.body.quantity || 1,
        unit: product.unit,
        price: product.isOnSale && product.salePrice ? product.salePrice : product.price,
        supermarket: product.supermarket._id,
        notes: req.body.notes || ''
      };
      
      shoppingList.items.push(newItem);
    }
    
    // Save shopping list
    await shoppingList.save();
    
    res.json(shoppingList);
  } catch (err) {
    console.error('Error adding product to shopping list:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Shopping list or product not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/shopping-lists/:id/add-ingredient/:ingredientId
// @desc    Add an ingredient to a shopping list
// @access  Private
router.post('/:id/add-ingredient/:ingredientId', auth, async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id);
    
    // Check if shopping list exists
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    // Check if user owns the shopping list
    if (shoppingList.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Get the ingredient
    const ingredient = await Ingredient.findById(req.params.ingredientId);
    
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    
    // Check if ingredient already in list
    const existingItemIndex = shoppingList.items.findIndex(
      item => item.ingredient && item.ingredient.toString() === req.params.ingredientId
    );
    
    // Get preferred supermarket price if available
    let price = ingredient.purchasePrice;
    let supermarketId = shoppingList.primarySupermarket;
    
    if (ingredient.preferredSupermarket) {
      supermarketId = ingredient.preferredSupermarket;
      
      const preferredPrice = ingredient.prices.find(
        p => p.supermarket.toString() === ingredient.preferredSupermarket.toString()
      );
      
      if (preferredPrice) {
        price = preferredPrice.price;
      }
    }
    
    if (existingItemIndex !== -1) {
      // Update quantity instead of adding new item
      const quantity = req.body.quantity || 1;
      shoppingList.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem = {
        ingredient: ingredient._id,
        name: ingredient.name,
        quantity: req.body.quantity || 1,
        unit: ingredient.purchaseUnit,
        price: price,
        supermarket: supermarketId,
        notes: req.body.notes || ''
      };
      
      shoppingList.items.push(newItem);
    }
    
    // Save shopping list
    await shoppingList.save();
    
    res.json(shoppingList);
  } catch (err) {
    console.error('Error adding ingredient to shopping list:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Shopping list or ingredient not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/shopping-lists/:id
// @desc    Delete a shopping list
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id);
    
    // Check if shopping list exists
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    // Check if user owns the shopping list
    if (shoppingList.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await shoppingList.remove();
    res.json({ message: 'Shopping list removed' });
  } catch (err) {
    console.error('Error deleting shopping list:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/shopping-lists/:id/complete
// @desc    Mark shopping list as complete
// @access  Private
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id);
    
    // Check if shopping list exists
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    // Check if user owns the shopping list
    if (shoppingList.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Mark as inactive and set completed date
    shoppingList.isActive = false;
    shoppingList.completedDate = new Date();
    
    await shoppingList.save();
    
    res.json(shoppingList);
  } catch (err) {
    console.error('Error completing shopping list:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
