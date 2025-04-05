const mongoose = require('mongoose');
const SupermarketProduct = require('../models/supermarketProduct.model');
const Supermarket = require('../models/supermarket.model');
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

// Seed function
const seedSupermarketProducts = async () => {
  try {
    // Get supermarket IDs
    const supermarketMap = await getSupermarketIds();
    
    // Check if we already have seeded products
    const existingCount = await SupermarketProduct.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing supermarket products. Skipping seeding to avoid duplicates.`);
      console.log('If you want to re-seed, please delete existing products first.');
      process.exit(0);
    }
    
    // Date for history records
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Common products with prices from different Australian supermarkets
    const products = [
      // DAIRY PRODUCTS
      {
        name: 'Milk Full Cream 2L',
        description: 'Full cream milk in 2 liter bottle',
        category: 'dairy',
        unit: 'bottle',
        packageSize: '2L',
        brand: 'Woolworths Homebrand',
        isAvailable: true,
        variants: [
          {
            supermarket: 'Woolworths',
            price: 3.10,
            productCode: 'WW-MILK-FC-2L',
            priceHistory: [
              { price: 3.00, date: lastWeek },
              { price: 3.10, date: today }
            ]
          },
          {
            supermarket: 'Coles',
            price: 3.15,
            productCode: 'CL-MILK-FC-2L',
            priceHistory: [
              { price: 3.05, date: lastWeek },
              { price: 3.15, date: today }
            ]
          },
          {
            supermarket: 'Aldi',
            price: 2.89,
            productCode: 'AL-MILK-FC-2L',
            priceHistory: [
              { price: 2.89, date: lastWeek },
              { price: 2.89, date: today }
            ]
          }
        ]
      },
      {
        name: 'Eggs Free Range 12pk',
        description: 'Free range eggs, dozen pack',
        category: 'dairy',
        unit: 'dozen',
        packageSize: '12 eggs',
        brand: 'Farm Fresh',
        isAvailable: true,
        variants: [
          {
            supermarket: 'Woolworths',
            price: 5.50,
            productCode: 'WW-EGGS-FR-12',
            priceHistory: [
              { price: 5.30, date: lastWeek },
              { price: 5.50, date: today }
            ]
          },
          {
            supermarket: 'Coles',
            price: 5.65,
            productCode: 'CL-EGGS-FR-12',
            priceHistory: [
              { price: 5.50, date: lastWeek },
              { price: 5.65, date: today }
            ]
          },
          {
            supermarket: 'Aldi',
            price: 5.20,
            productCode: 'AL-EGGS-FR-12',
            isOnSale: true,
            salePrice: 4.80,
            saleEndDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            priceHistory: [
              { price: 5.20, date: lastWeek },
              { price: 4.80, date: today }
            ]
          }
        ]
      },
      {
        name: 'Butter Unsalted 250g',
        description: 'Unsalted butter, 250g block',
        category: 'dairy',
        unit: 'block',
        packageSize: '250g',
        brand: 'Western Star',
        isAvailable: true,
        variants: [
          {
            supermarket: 'Woolworths',
            price: 5.40,
            productCode: 'WW-BUT-US-250',
            priceHistory: [
              { price: 5.40, date: lastWeek },
              { price: 5.40, date: today }
            ]
          },
          {
            supermarket: 'Coles',
            price: 5.40,
            productCode: 'CL-BUT-US-250',
            priceHistory: [
              { price: 5.30, date: lastWeek },
              { price: 5.40, date: today }
            ]
          },
          {
            supermarket: 'Aldi',
            price: 4.99,
            productCode: 'AL-BUT-US-250',
            priceHistory: [
              { price: 4.99, date: lastWeek },
              { price: 4.99, date: today }
            ]
          }
        ]
      },
      
      // MEAT PRODUCTS
      {
        name: 'Chicken Breast Fillets',
        description: 'Fresh chicken breast fillets',
        category: 'meat',
        unit: 'kg',
        packageSize: 'approx. 500g',
        brand: 'Woolworths',
        isAvailable: true,
        variants: [
          {
            supermarket: 'Woolworths',
            price: 12.50,
            productCode: 'WW-CHK-BR-KG',
            priceHistory: [
              { price: 13.00, date: lastWeek },
              { price: 12.50, date: today }
            ]
          },
          {
            supermarket: 'Coles',
            price: 12.80,
            productCode: 'CL-CHK-BR-KG',
            priceHistory: [
              { price: 13.50, date: lastWeek },
              { price: 12.80, date: today }
            ]
          },
          {
            supermarket: 'Aldi',
            price: 11.99,
            productCode: 'AL-CHK-BR-KG',
            priceHistory: [
              { price: 11.99, date: lastWeek },
              { price: 11.99, date: today }
            ]
          }
        ]
      },
      {
        name: 'Beef Mince Premium',
        description: 'Premium beef mince, 5% fat',
        category: 'meat',
        unit: 'kg',
        packageSize: 'approx. 500g',
        brand: 'Coles',
        isAvailable: true,
        variants: [
          {
            supermarket: 'Woolworths',
            price: 14.00,
            productCode: 'WW-BEEF-MNC-KG',
            priceHistory: [
              { price: 14.50, date: lastWeek },
              { price: 14.00, date: today }
            ]
          },
          {
            supermarket: 'Coles',
            price: 13.75,
            productCode: 'CL-BEEF-MNC-KG',
            isOnSale: true,
            salePrice: 12.50,
            saleEndDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            priceHistory: [
              { price: 13.75, date: lastWeek },
              { price: 12.50, date: today }
            ]
          },
          {
            supermarket: 'Aldi',
            price: 13.49,
            productCode: 'AL-BEEF-MNC-KG',
            priceHistory: [
              { price: 13.99, date: lastWeek },
              { price: 13.49, date: today }
            ]
          }
        ]
      },
      
      // PRODUCE
      {
        name: 'Bananas',
        description: 'Fresh Cavendish bananas',
        category: 'produce',
        unit: 'kg',
        packageSize: 'loose',
        brand: 'Fresh Produce',
        isAvailable: true,
        variants: [
          {
            supermarket: 'Woolworths',
            price: 4.50,
            productCode: 'WW-BANA-KG',
            priceHistory: [
              { price: 4.90, date: lastWeek },
              { price: 4.50, date: today }
            ]
          },
          {
            supermarket: 'Coles',
            price: 4.40,
            productCode: 'CL-BANA-KG',
            priceHistory: [
              { price: 4.70, date: lastWeek },
              { price: 4.40, date: today }
            ]
          },
          {
            supermarket: 'Aldi',
            price: 3.99,
            productCode: 'AL-BANA-KG',
            priceHistory: [
              { price: 4.20, date: lastWeek },
              { price: 3.99, date: today }
            ]
          }
        ]
      },
      {
        name: 'Tomatoes Roma',
        description: 'Fresh Roma tomatoes',
        category: 'produce',
        unit: 'kg',
        packageSize: 'loose',
        brand: 'Fresh Produce',
        isAvailable: true,
        variants: [
          {
            supermarket: 'Woolworths',
            price: 5.50,
            productCode: 'WW-TOM-RMA-KG',
            priceHistory: [
              { price: 5.90, date: lastWeek },
              { price: 5.50, date: today }
            ]
          },
          {
            supermarket: 'Coles',
            price: 5.60,
            productCode: 'CL-TOM-RMA-KG',
            priceHistory: [
              { price: 5.80, date: lastWeek },
              { price: 5.60, date: today }
            ]
          },
          {
            supermarket: 'Aldi',
            price: 4.99,
            productCode: 'AL-TOM-RMA-KG',
            priceHistory: [
              { price: 5.30, date: lastWeek },
              { price: 4.99, date: today }
            ]
          }
        ]
      },
      
      // GRAINS
      {
        name: 'Pasta Spaghetti 500g',
        description: 'Dried spaghetti pasta',
        category: 'grains',
        unit: 'pack',
        packageSize: '500g',
        brand: 'Barilla',
        isAvailable: true,
        variants: [
          {
            supermarket: 'Woolworths',
            price: 3.50,
            productCode: 'WW-PASTA-SPAG-500',
            priceHistory: [
              { price: 3.50, date: lastWeek },
              { price: 3.50, date: today }
            ]
          },
          {
            supermarket: 'Coles',
            price: 3.60,
            productCode: 'CL-PASTA-SPAG-500',
            priceHistory: [
              { price: 3.60, date: lastWeek },
              { price: 3.60, date: today }
            ]
          },
          {
            supermarket: 'Aldi',
            price: 2.99,
            productCode: 'AL-PASTA-SPAG-500',
            priceHistory: [
              { price: 2.99, date: lastWeek },
              { price: 2.99, date: today }
            ]
          }
        ]
      },
      {
        name: 'Rice Basmati 1kg',
        description: 'Basmati long grain rice',
        category: 'grains',
        unit: 'pack',
        packageSize: '1kg',
        brand: 'SunRice',
        isAvailable: true,
        variants: [
          {
            supermarket: 'Woolworths',
            price: 6.90,
            productCode: 'WW-RICE-BAS-1KG',
            priceHistory: [
              { price: 7.20, date: lastWeek },
              { price: 6.90, date: today }
            ]
          },
          {
            supermarket: 'Coles',
            price: 7.00,
            productCode: 'CL-RICE-BAS-1KG',
            priceHistory: [
              { price: 7.00, date: lastWeek },
              { price: 7.00, date: today }
            ]
          },
          {
            supermarket: 'Aldi',
            price: 6.49,
            productCode: 'AL-RICE-BAS-1KG',
            priceHistory: [
              { price: 6.49, date: lastWeek },
              { price: 6.49, date: today }
            ]
          }
        ]
      },
      
      // BAKING
      {
        name: 'Flour Plain 1kg',
        description: 'All-purpose plain flour',
        category: 'other',
        unit: 'pack',
        packageSize: '1kg',
        brand: 'White Wings',
        isAvailable: true,
        variants: [
          {
            supermarket: 'Woolworths',
            price: 2.80,
            productCode: 'WW-FLOUR-PLN-1KG',
            priceHistory: [
              { price: 2.80, date: lastWeek },
              { price: 2.80, date: today }
            ]
          },
          {
            supermarket: 'Coles',
            price: 2.90,
            productCode: 'CL-FLOUR-PLN-1KG',
            priceHistory: [
              { price: 2.90, date: lastWeek },
              { price: 2.90, date: today }
            ]
          },
          {
            supermarket: 'Aldi',
            price: 2.29,
            productCode: 'AL-FLOUR-PLN-1KG',
            priceHistory: [
              { price: 2.29, date: lastWeek },
              { price: 2.29, date: today }
            ]
          }
        ]
      },
      {
        name: 'Sugar White 1kg',
        description: 'White granulated sugar',
        category: 'other',
        unit: 'pack',
        packageSize: '1kg',
        brand: 'CSR',
        isAvailable: true,
        variants: [
          {
            supermarket: 'Woolworths',
            price: 2.50,
            productCode: 'WW-SUGAR-WHT-1KG',
            priceHistory: [
              { price: 2.40, date: lastWeek },
              { price: 2.50, date: today }
            ]
          },
          {
            supermarket: 'Coles',
            price: 2.55,
            productCode: 'CL-SUGAR-WHT-1KG',
            priceHistory: [
              { price: 2.55, date: lastWeek },
              { price: 2.55, date: today }
            ]
          },
          {
            supermarket: 'Aldi',
            price: 2.19,
            productCode: 'AL-SUGAR-WHT-1KG',
            priceHistory: [
              { price: 2.19, date: lastWeek },
              { price: 2.19, date: today }
            ]
          }
        ]
      }
    ];
    
    // Process products and variants for insertion
    const productsToInsert = [];
    
    for (const product of products) {
      const { variants, ...productBase } = product;
      
      for (const variant of variants) {
        const { supermarket: supermarketName, priceHistory, ...variantData } = variant;
        
        const supermarketId = supermarketMap[supermarketName];
        if (!supermarketId) {
          console.warn(`Supermarket "${supermarketName}" not found, skipping product variant.`);
          continue;
        }
        
        productsToInsert.push({
          ...productBase,
          ...variantData,
          supermarket: supermarketId,
          priceHistory: priceHistory || [{ price: variantData.price, date: new Date() }],
          currency: 'AUD'
        });
      }
    }
    
    // Insert products
    const insertedProducts = await SupermarketProduct.insertMany(productsToInsert);
    console.log(`Seeded ${insertedProducts.length} supermarket products`);
    
    console.log('Supermarket products seeding completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding supermarket products:', err);
    process.exit(1);
  }
};

// Run the seed function
seedSupermarketProducts();
