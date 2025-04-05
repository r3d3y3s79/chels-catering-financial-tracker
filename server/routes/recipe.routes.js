const express = require('express');
const router = express.Router();
const Recipe = require('../models/recipe.model');
const Ingredient = require('../models/ingredient.model');
const auth = require('../middleware/auth');

// @route   GET api/recipes
// @desc    Get all recipes
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.user.id })
      .populate('ingredients.ingredient', 'name purchasePrice purchaseUnit recipeUnit conversionRatio');
    res.json(recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/recipes/:id
// @desc    Get recipe by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('ingredients.ingredient', 'name purchasePrice purchaseUnit recipeUnit conversionRatio');
    
    // Check if recipe exists
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if user owns the recipe
    if (recipe.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    res.json(recipe);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/recipes
// @desc    Create a new recipe
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      servings, 
      ingredients,
      instructions,
      preparationTime,
      cookingTime,
      tags,
      notes
    } = req.body;
    
    // Validate ingredients
    if (ingredients && ingredients.length > 0) {
      for (const item of ingredients) {
        // Check if ingredient exists
        const ingredientExists = await Ingredient.findById(item.ingredient);
        if (!ingredientExists) {
          return res.status(400).json({ message: `Ingredient with ID ${item.ingredient} not found` });
        }
      }
    }
    
    // Create new recipe
    const newRecipe = new Recipe({
      user: req.user.id,
      name,
      description,
      servings,
      ingredients,
      instructions,
      preparationTime,
      cookingTime,
      tags,
      notes
    });
    
    // Calculate total cost
    let totalCost = 0;
    if (ingredients && ingredients.length > 0) {
      for (const item of ingredients) {
        const ingredient = await Ingredient.findById(item.ingredient);
        if (ingredient) {
          // Calculate cost based on quantity and conversion ratio
          const costPerRecipeUnit = ingredient.purchasePrice / ingredient.conversionRatio;
          const itemCost = costPerRecipeUnit * item.quantity;
          totalCost += itemCost;
        }
      }
    }
    
    newRecipe.totalCost = totalCost;
    newRecipe.costPerServing = servings > 0 ? totalCost / servings : 0;
    
    const recipe = await newRecipe.save();
    res.json(recipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/recipes/:id
// @desc    Update a recipe
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    // Check if recipe exists
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if user owns the recipe
    if (recipe.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Validate ingredients if provided
    if (req.body.ingredients && req.body.ingredients.length > 0) {
      for (const item of req.body.ingredients) {
        // Check if ingredient exists
        const ingredientExists = await Ingredient.findById(item.ingredient);
        if (!ingredientExists) {
          return res.status(400).json({ message: `Ingredient with ID ${item.ingredient} not found` });
        }
      }
    }
    
    // Calculate total cost if ingredients are provided
    if (req.body.ingredients && req.body.ingredients.length > 0) {
      let totalCost = 0;
      for (const item of req.body.ingredients) {
        const ingredient = await Ingredient.findById(item.ingredient);
        if (ingredient) {
          // Calculate cost based on quantity and conversion ratio
          const costPerRecipeUnit = ingredient.purchasePrice / ingredient.conversionRatio;
          const itemCost = costPerRecipeUnit * item.quantity;
          totalCost += itemCost;
        }
      }
      
      req.body.totalCost = totalCost;
      req.body.costPerServing = req.body.servings > 0 ? totalCost / req.body.servings : 0;
    }
    
    // Update recipe
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('ingredients.ingredient', 'name purchasePrice purchaseUnit recipeUnit conversionRatio');
    
    res.json(updatedRecipe);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/recipes/:id
// @desc    Delete a recipe
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    // Check if recipe exists
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if user owns the recipe
    if (recipe.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await recipe.remove();
    res.json({ message: 'Recipe removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/recipes/suggestions
// @desc    Get recipe suggestions based on available ingredients
// @access  Private
router.get('/suggestions/available', auth, async (req, res) => {
  try {
    // Get all user's ingredients
    const userIngredients = await Ingredient.find({ user: req.user.id });
    const ingredientIds = userIngredients.map(ingredient => ingredient._id);
    
    // Find recipes that use these ingredients
    const recipes = await Recipe.find({ user: req.user.id })
      .populate('ingredients.ingredient', 'name purchasePrice purchaseUnit recipeUnit conversionRatio');
    
    // Calculate a match score for each recipe
    const recipesWithScore = recipes.map(recipe => {
      let matchCount = 0;
      let totalIngredients = recipe.ingredients.length;
      
      recipe.ingredients.forEach(item => {
        if (ingredientIds.some(id => id.equals(item.ingredient._id))) {
          matchCount++;
        }
      });
      
      const matchScore = totalIngredients > 0 ? (matchCount / totalIngredients) * 100 : 0;
      
      return {
        ...recipe.toObject(),
        matchScore,
        matchCount,
        totalIngredients
      };
    });
    
    // Sort by match score (highest first)
    recipesWithScore.sort((a, b) => b.matchScore - a.matchScore);
    
    res.json(recipesWithScore);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/recipes/profitable
// @desc    Get recipes sorted by profitability
// @access  Private
router.get('/suggestions/profitable', auth, async (req, res) => {
  try {
    // Get all user's recipes with cost information
    const recipes = await Recipe.find({ user: req.user.id })
      .populate('ingredients.ingredient', 'name purchasePrice purchaseUnit recipeUnit conversionRatio');
    
    // Sort by cost per serving (lowest first)
    recipes.sort((a, b) => a.costPerServing - b.costPerServing);
    
    res.json(recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;