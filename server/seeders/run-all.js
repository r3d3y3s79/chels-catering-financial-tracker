// Script to run all seeders in sequence
const { spawn } = require('child_process');
const path = require('path');

// Array of seeder files to run in order
const seeders = [
  'supermarkets.seed.js',
  'ingredients.seed.js',
  'supermarketProducts.seed.js'
];

// Function to run a single seeder
const runSeeder = (seederFile) => {
  return new Promise((resolve, reject) => {
    console.log(`\n===== Running ${seederFile} =====\n`);
    
    const seederPath = path.join(__dirname, seederFile);
    const child = spawn('node', [seederPath], { stdio: 'inherit' });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n${seederFile} completed successfully\n`);
        resolve();
      } else {
        console.error(`\n${seederFile} failed with code ${code}\n`);
        reject(new Error(`${seederFile} exited with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      console.error(`\nFailed to start ${seederFile}: ${err}\n`);
      reject(err);
    });
  });
};

// Run all seeders in sequence
const runAllSeeders = async () => {
  try {
    for (const seeder of seeders) {
      await runSeeder(seeder);
    }
    console.log('\n===== All seeders completed successfully =====\n');
    process.exit(0);
  } catch (err) {
    console.error('\n===== Seeding process failed =====\n');
    console.error(err);
    process.exit(1);
  }
};

// Start the seeding process
runAllSeeders();
