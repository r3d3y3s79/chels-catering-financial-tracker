const express = require('express');
const router = express.Router();
const SupermarketProduct = require('../models/supermarketProduct.model');
const Supermarket = require('../models/supermarket.model');
const auth = require('../middleware/auth');

// @route   GET api/supermarket-products
// @desc    Get all supermarket products with filtering and pagination
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      supermarket,
      category,
      search,
      minPrice,
      maxPrice,
      onSale,
      sortBy,
      sortOrder,
      page,
      limit
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (supermarket) {
      filter.supermarket = supermarket;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }
    
    if (onSale === 'true') {
      filter.isOnSale = true;
    }

    // Set up pagination
    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 20;
    const skip = (pageNum - 1) * pageSize;
    
    // Set up sorting
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.name = 1; // Default sort by name ascending
    }

    // Get products with pagination
    const products = await SupermarketProduct.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .populate('supermarket', 'name');
    
    // Get total count for pagination
    const total = await SupermarketProduct.countDocuments(filter);
    
    res.json({
      products,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
      totalCount: total
    });
  } catch (err) {
    console.error('Error fetching supermarket products:', err);
    res.status(500).send('Server error');
  }
});

// @route   GET api/supermarket-products/:id
// @desc    Get supermarket product by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await SupermarketProduct.findById(req.params.id)
      .populate('supermarket', 'name logoUrl websiteUrl');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    console.error('Error fetching supermarket product:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/supermarket-products/search/:query
// @desc    Search supermarket products by name or description
// @access  Private
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    const { supermarket } = req.query;
    
    const filter = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } }
      ]
    };
    
    if (supermarket) {
      filter.supermarket = supermarket;
    }
    
    const products = await SupermarketProduct.find(filter)
      .sort({ name: 1 })
      .limit(20)
      .populate('supermarket', 'name');
    
    res.json(products);
  } catch (err) {
    console.error('Error searching supermarket products:', err);
    res.status(500).send('Server error');
  }
});

// @route   GET api/supermarket-products/compare/:productName
// @desc    Compare product prices across supermarkets
// @access  Private
router.get('/compare/:productName', auth, async (req, res) => {
  try {
    const { productName } = req.params;
    
    // Find similar products across all supermarkets
    const products = await SupermarketProduct.find({
      name: { $regex: productName, $options: 'i' }
    })
    .populate('supermarket', 'name logoUrl')
    .sort({ price: 1 }); // Sort by price, lowest first
    
    // Group by supermarket
    const groupedByStore = {};
    
    products.forEach(product => {
      const supermarketId = product.supermarket._id.toString();
      
      if (!groupedByStore[supermarketId]) {
        groupedByStore[supermarketId] = {
          supermarket: product.supermarket,
          products: []
        };
      }
      
      groupedByStore[supermarketId].products.push(product);
    });
    
    res.json({
      query: productName,
      results: Object.values(groupedByStore)
    });
  } catch (err) {
    console.error('Error comparing supermarket products:', err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/supermarket-products
// @desc    Create a new supermarket product
// @access  Private (Admin only in a real app)
router.post('/', auth, async (req, res) => {
  try {
    // In a real app, check if the user is an admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }
    
    const {
      name,
      description,
      supermarket,
      category,
      price,
      unit,
      packageSize,
      brand,
      productCode,
      barcode,
      imageUrl,
      isOnSale,
      salePrice,
      saleEndDate,
      nutritionalInfo,
      isAvailable
    } = req.body;
    
    // Create new product
    const newProduct = new SupermarketProduct({
      name,
      description,
      supermarket,
      category: category || 'other',
      price,
      currency: 'AUD', // Default for Australian market
      unit,
      packageSize,
      brand,
      productCode,
      barcode,
      imageUrl,
      isOnSale: isOnSale || false,
      salePrice,
      saleEndDate,
      nutritionalInfo,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      priceHistory: [{ price, date: new Date() }]
    });
    
    await newProduct.save();
    res.json(newProduct);
  } catch (err) {
    console.error('Error creating supermarket product:', err);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/supermarket-products/:id
// @desc    Update a supermarket product
// @access  Private (Admin only in a real app)
router.put('/:id', auth, async (req, res) => {
  try {
    // In a real app, check if the user is an admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }
    
    const product = await SupermarketProduct.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // If price is changing, add to price history
    if (req.body.price && req.body.price !== product.price) {
      if (!product.priceHistory) {
        product.priceHistory = [];
      }
      
      product.priceHistory.push({
        price: req.body.price,
        date: new Date()
      });
    }
    
    // Update product
    const updatedProduct = await SupermarketProduct.findByIdAndUpdate(
      req.params.id,
      { 
        $set: {
          ...req.body,
          lastUpdated: new Date(),
          priceHistory: product.priceHistory
        } 
      },
      { new: true }
    );
    
    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating supermarket product:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/supermarket-products/:id
// @desc    Delete a supermarket product
// @access  Private (Admin only in a real app)
router.delete('/:id', auth, async (req, res) => {
  try {
    // In a real app, check if the user is an admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }
    
    const product = await SupermarketProduct.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await product.remove();
    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error('Error deleting supermarket product:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
