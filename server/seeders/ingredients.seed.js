const mongoose = require('mongoose');
const Ingredient = require('../models/ingredient.model');
const Supermarket = require('../models/supermarket.model');
const User = require('../models/user.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/catering-cost-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully for seeding'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Function to get supermarket IDs
const getSupermarketIds = async () => {
  try {
    const supermarkets = await Supermarket.find();
    const supermarketMap = {};
    
    supermarkets.forEach(market => {
      supermarketMap[market.name] = market._id;
    });
    
    return supermarketMap;
  } catch (err) {
    console.error('Error fetching supermarkets:', err);
    process.exit(1);
  }
};

// Function to get or create admin user
const getAdminUser = async () => {
  try {
    // Check if admin user exists
    let admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      // Create admin user
      admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: '$2a$10$XFNFCqGRlJ/mJjm.HH1g4uZspbwSGU0xZ9/Lf.ZQ7nK3BmZxO5Vxy', // hashed 'password123'
        role: 'admin'
      });
      
      await admin.save();
      console.log('Created admin user');
    }
    
    return admin._id;
  } catch (err) {
    console.error('Error getting/creating admin user:', err);
    process.exit(1);
  }
};

// Seed function
const seedIngredients = async () => {
  try {
    // Get supermarket IDs and admin user ID
    const supermarketMap = await getSupermarketIds();
    const adminId = await getAdminUser();
    
    // Check if we already have seeded ingredients
    const existingCount = await Ingredient.countDocuments({ isStandardItem: true });
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing standard ingredients. Skipping seeding to avoid duplicates.`);
      console.log('If you want to re-seed, please delete existing standard ingredients first.');
      process.exit(0);
    }
    
    // Date functions for price history
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Common Australian grocery items with prices in AUD
    // These are representative examples - actual prices would vary
    const commonIngredients = [
      // Dairy
      {
        name: 'Milk - Full Cream',
        description: 'Standard full cream cow\'s milk',
        category: 'dairy',
        purchasePrice: 2.60, // Default price
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 2.60, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 2.65, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 2.39, priceDate: today }
        ],
        priceHistory: [
          { supermarket: supermarketMap['Woolworths'], price: 2.50, date: lastWeek },
          { supermarket: supermarketMap['Coles'], price: 2.65, date: lastWeek },
          { supermarket: supermarketMap['Aldi'], price: 2.39, date: lastWeek }
        ],
        purchaseUnit: 'L',
        recipeUnit: 'ml',
        conversionRatio: 1000,
        barcode: '9300601211419',
        inStock: true,
        wastagePercentage: 5,
        tags: ['dairy', 'milk', 'basic'],
        isStandardItem: true
      },
      {
        name: 'Butter - Unsalted',
        description: 'Pure unsalted butter',
        category: 'dairy',
        purchasePrice: 5.50,
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 5.50, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 5.40, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 4.99, priceDate: today }
        ],
        purchaseUnit: 'kg',
        recipeUnit: 'g',
        conversionRatio: 1000,
        inStock: true,
        wastagePercentage: 0,
        tags: ['dairy', 'butter', 'baking'],
        isStandardItem: true
      },
      {
        name: 'Eggs - Free Range',
        description: 'Large free range eggs',
        category: 'dairy',
        purchasePrice: 6.50,
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 6.50, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 6.75, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 5.99, priceDate: today }
        ],
        purchaseUnit: 'dozen',
        recipeUnit: 'egg',
        conversionRatio: 12,
        inStock: true,
        wastagePercentage: 0,
        tags: ['eggs', 'protein', 'baking'],
        isStandardItem: true
      },
      
      // Meat
      {
        name: 'Chicken Breast - Skinless',
        description: 'Skinless chicken breast fillets',
        category: 'meat',
        purchasePrice: 11.00,
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 11.00, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 11.50, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 10.49, priceDate: today }
        ],
        purchaseUnit: 'kg',
        recipeUnit: 'g',
        conversionRatio: 1000,
        inStock: true,
        wastagePercentage: 10,
        tags: ['protein', 'meat', 'chicken'],
        isStandardItem: true
      },
      {
        name: 'Beef Mince - Premium',
        description: 'Premium lean beef mince',
        category: 'meat',
        purchasePrice: 14.00,
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 14.00, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 13.50, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 12.99, priceDate: today }
        ],
        purchaseUnit: 'kg',
        recipeUnit: 'g',
        conversionRatio: 1000,
        inStock: true,
        wastagePercentage: 10,
        tags: ['protein', 'meat', 'beef'],
        isStandardItem: true
      },
      
      // Produce
      {
        name: 'Bananas',
        description: 'Cavendish bananas',
        category: 'produce',
        purchasePrice: 3.90,
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 3.90, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 4.20, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 3.50, priceDate: today }
        ],
        purchaseUnit: 'kg',
        recipeUnit: 'g',
        conversionRatio: 1000,
        inStock: true,
        wastagePercentage: 20,
        tags: ['fruit', 'fresh', 'breakfast'],
        isStandardItem: true
      },
      {
        name: 'Carrots',
        description: 'Fresh carrots',
        category: 'produce',
        purchasePrice: 2.50,
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 2.50, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 2.60, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 2.30, priceDate: today }
        ],
        purchaseUnit: 'kg',
        recipeUnit: 'g',
        conversionRatio: 1000,
        inStock: true,
        wastagePercentage: 15,
        tags: ['vegetable', 'fresh'],
        isStandardItem: true
      },
      {
        name: 'Potatoes - Brushed',
        description: 'Standard brushed potatoes',
        category: 'produce',
        purchasePrice: 3.80,
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 3.80, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 4.00, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 3.50, priceDate: today }
        ],
        purchaseUnit: 'kg',
        recipeUnit: 'g',
        conversionRatio: 1000,
        inStock: true,
        wastagePercentage: 10,
        tags: ['vegetable', 'staple'],
        isStandardItem: true
      },
      
      // Grains
      {
        name: 'Pasta - Spaghetti',
        description: 'Dried spaghetti pasta',
        category: 'grains',
        purchasePrice: 1.80,
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 1.80, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 1.90, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 1.50, priceDate: today }
        ],
        purchaseUnit: 'kg',
        recipeUnit: 'g',
        conversionRatio: 1000,
        inStock: true,
        wastagePercentage: 0,
        tags: ['pasta', 'Italian', 'staple'],
        isStandardItem: true
      },
      {
        name: 'Rice - White Long Grain',
        description: 'White long grain rice',
        category: 'grains',
        purchasePrice: 2.90,
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 2.90, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 3.00, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 2.75, priceDate: today }
        ],
        purchaseUnit: 'kg',
        recipeUnit: 'g',
        conversionRatio: 1000,
        inStock: true,
        wastagePercentage: 0,
        tags: ['rice', 'staple'],
        isStandardItem: true
      },
      
      // Spices
      {
        name: 'Pepper - Black Ground',
        description: 'Ground black pepper',
        category: 'spices',
        purchasePrice: 3.50,
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 3.50, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 3.65, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 3.20, priceDate: today }
        ],
        purchaseUnit: '100g',
        recipeUnit: 'g',
        conversionRatio: 100,
        inStock: true,
        wastagePercentage: 0,
        tags: ['spice', 'seasoning'],
        isStandardItem: true
      },
      {
        name: 'Salt - Table',
        description: 'Standard table salt',
        category: 'spices',
        purchasePrice: 1.10,
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 1.10, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 1.05, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 0.95, priceDate: today }
        ],
        purchaseUnit: 'kg',
        recipeUnit: 'g',
        conversionRatio: 1000,
        inStock: true,
        wastagePercentage: 0,
        tags: ['seasoning', 'basic'],
        isStandardItem: true
      },
      
      // Beverages
      {
        name: 'Coffee - Ground',
        description: 'Medium roast ground coffee',
        category: 'beverages',
        purchasePrice: 9.50,
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 9.50, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 10.00, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 8.99, priceDate: today }
        ],
        purchaseUnit: '250g',
        recipeUnit: 'g',
        conversionRatio: 250,
        inStock: true,
        wastagePercentage: 0,
        tags: ['coffee', 'beverage'],
        isStandardItem: true
      },
      {
        name: 'Tea Bags - Black Tea',
        description: 'Standard black tea bags',
        category: 'beverages',
        purchasePrice: 5.20,
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 5.20, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 5.50, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 4.80, priceDate: today }
        ],
        purchaseUnit: '100 bags',
        recipeUnit: 'bag',
        conversionRatio: 100,
        inStock: true,
        wastagePercentage: 0,
        tags: ['tea', 'beverage'],
        isStandardItem: true
      },
      
      // Other
      {
        name: 'Flour - Plain',
        description: 'All-purpose plain flour',
        category: 'other',
        purchasePrice: 2.30,
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 2.30, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 2.40, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 2.15, priceDate: today }
        ],
        purchaseUnit: 'kg',
        recipeUnit: 'g',
        conversionRatio: 1000,
        inStock: true,
        wastagePercentage: 0,
        tags: ['baking', 'staple'],
        isStandardItem: true
      },
      {
        name: 'Sugar - White',
        description: 'White granulated sugar',
        category: 'other',
        purchasePrice: 2.20,
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 2.20, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 2.30, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 2.10, priceDate: today }
        ],
        purchaseUnit: 'kg',
        recipeUnit: 'g',
        conversionRatio: 1000,
        inStock: true,
        wastagePercentage: 0,
        tags: ['baking', 'sweetener'],
        isStandardItem: true
      },
      {
        name: 'Olive Oil - Extra Virgin',
        description: 'Extra virgin olive oil',
        category: 'other',
        purchasePrice: 10.50,
        currency: 'AUD',
        prices: [
          { supermarket: supermarketMap['Woolworths'], price: 10.50, priceDate: today },
          { supermarket: supermarketMap['Coles'], price: 11.00, priceDate: today },
          { supermarket: supermarketMap['Aldi'], price: 9.99, priceDate: today }
        ],
        purchaseUnit: 'L',
        recipeUnit: 'ml',
        conversionRatio: 1000,
        inStock: true,
        wastagePercentage: 0,
        tags: ['oil', 'cooking'],
        isStandardItem: true
      }
    ];
    
    // Add admin user ID to each ingredient
    const ingredientsWithUser = commonIngredients.map(ingredient => ({
      ...ingredient,
      user: adminId
    }));
    
    // Insert the ingredients
    const createdIngredients = await Ingredient.insertMany(ingredientsWithUser);
    console.log(`Seeded ${createdIngredients.length} ingredients with Australian prices`);
    
    console.log('Ingredients seeding completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding ingredients:', err);
    process.exit(1);
  }
};

// Run the seed function
seedIngredients();
