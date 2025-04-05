const mongoose = require('mongoose');
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

// Australian supermarkets data
const supermarkets = [
  {
    name: 'Woolworths',
    logoUrl: '/uploads/supermarkets/woolworths-logo.png',
    websiteUrl: 'https://www.woolworths.com.au',
    scrapingEnabled: false,
    scrapingUrls: {
      baseUrl: 'https://www.woolworths.com.au',
      searchEndpoint: '/shop/search/products?searchTerm='
    }
  },
  {
    name: 'Coles',
    logoUrl: '/uploads/supermarkets/coles-logo.png',
    websiteUrl: 'https://www.coles.com.au',
    scrapingEnabled: false,
    scrapingUrls: {
      baseUrl: 'https://www.coles.com.au',
      searchEndpoint: '/search?q='
    }
  },
  {
    name: 'Aldi',
    logoUrl: '/uploads/supermarkets/aldi-logo.png',
    websiteUrl: 'https://www.aldi.com.au',
    scrapingEnabled: false,
    scrapingUrls: {
      baseUrl: 'https://www.aldi.com.au',
      searchEndpoint: '/search?q='
    }
  },
  {
    name: 'IGA',
    logoUrl: '/uploads/supermarkets/iga-logo.png',
    websiteUrl: 'https://www.iga.com.au',
    scrapingEnabled: false,
    scrapingUrls: {
      baseUrl: 'https://www.iga.com.au',
      searchEndpoint: '/search?q='
    }
  },
  {
    name: 'Harris Farm',
    logoUrl: '/uploads/supermarkets/harrisfarm-logo.png',
    websiteUrl: 'https://www.harrisfarm.com.au',
    scrapingEnabled: false,
    scrapingUrls: {
      baseUrl: 'https://www.harrisfarm.com.au',
      searchEndpoint: '/search?q='
    }
  },
  {
    name: 'Costco',
    logoUrl: '/uploads/supermarkets/costco-logo.png',
    websiteUrl: 'https://www.costco.com.au',
    scrapingEnabled: false,
    scrapingUrls: {
      baseUrl: 'https://www.costco.com.au',
      searchEndpoint: '/search?q='
    }
  },
  {
    name: 'Other',
    logoUrl: '/uploads/supermarkets/other-store.png',
    websiteUrl: '',
    scrapingEnabled: false
  }
];

// Seed function
const seedSupermarkets = async () => {
  try {
    // Clear existing data
    await Supermarket.deleteMany({});
    console.log('Cleared existing supermarkets data');
    
    // Insert new data
    const createdSupermarkets = await Supermarket.insertMany(supermarkets);
    console.log(`Seeded ${createdSupermarkets.length} supermarkets`);
    
    // Output the IDs for reference in other seed scripts
    console.log('Supermarket IDs for reference:');
    createdSupermarkets.forEach(market => {
      console.log(`${market.name}: ${market._id}`);
    });
    
    console.log('Supermarkets seeding completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding supermarkets:', err);
    process.exit(1);
  }
};

// Run the seed function
seedSupermarkets();
