import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StoreIcon from '@mui/icons-material/Store';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';

import AlertContext from '../../context/alert/alertContext';

const IngredientSearch = () => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [supermarkets, setSupermarkets] = useState([]);
  const [selectedSupermarket, setSelectedSupermarket] = useState('');
  const [ingredientResults, setIngredientResults] = useState([]);
  const [productResults, setProductResults] = useState([]);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [activeShoppingList, setActiveShoppingList] = useState(null);
  const [loadingShoppingList, setLoadingShoppingList] = useState(true);
  
  // Load supermarkets and active shopping list on component mount
  useEffect(() => {
    const getSupermarkets = async () => {
      try {
        const res = await axios.get('/api/supermarkets');
        setSupermarkets(res.data);
      } catch (err) {
        console.error('Error fetching supermarkets:', err);
      }
    };
    
    const getActiveShoppingList = async () => {
      try {
        const res = await axios.get('/api/shopping-lists/status/active');
        setActiveShoppingList(res.data);
        setLoadingShoppingList(false);
      } catch (err) {
        console.error('Error fetching active shopping list:', err);
        setLoadingShoppingList(false);
      }
    };
    
    getSupermarkets();
    getActiveShoppingList();
  }, []);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    // Clear comparison results when switching away from comparison tab
    if (newValue !== 2) {
      setComparisonResults(null);
    }
  };
  
  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setAlert('Please enter a search term', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      // Search depends on the active tab
      if (selectedTab === 0) {
        // Ingredient search
        const ingredientRes = await axios.get('/api/ingredients/search', {
          params: { query: searchTerm.trim() }
        });
        setIngredientResults(ingredientRes.data);
        setProductResults([]);
        setComparisonResults(null);
      } else if (selectedTab === 1) {
        // Product search
        const productRes = await axios.get('/api/supermarket-products/search/' + searchTerm.trim(), {
          params: { supermarket: selectedSupermarket }
        });
        setProductResults(productRes.data);
        setIngredientResults([]);
        setComparisonResults(null);
      } else if (selectedTab === 2) {
        // Price comparison
        const comparisonRes = await axios.get('/api/supermarket-products/compare/' + searchTerm.trim());
        setComparisonResults(comparisonRes.data);
        setIngredientResults([]);
        setProductResults([]);
      }
    } catch (err) {
      console.error('Error searching:', err);
      setAlert('Error performing search', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle adding a product to shopping list
  const handleAddToShoppingList = async (product) => {
    if (!activeShoppingList) {
      // Create a new shopping list if none exists
      try {
        setLoadingShoppingList(true);
        
        const newListRes = await axios.post('/api/shopping-lists', {
          name: 'Shopping List ' + new Date().toLocaleDateString(),
          description: 'Automatically created from search'
        });
        
        setActiveShoppingList(newListRes.data);
        
        // Now add the product to the new list
        await axios.post(`/api/shopping-lists/${newListRes.data._id}/add-product/${product._id}`);
        
        setAlert('Created new shopping list and added product', 'success');
      } catch (err) {
        console.error('Error creating shopping list:', err);
        setAlert('Failed to create shopping list', 'error');
      } finally {
        setLoadingShoppingList(false);
      }
    } else {
      // Add to existing active list
      try {
        await axios.post(`/api/shopping-lists/${activeShoppingList._id}/add-product/${product._id}`);
        setAlert('Added to shopping list', 'success');
      } catch (err) {
        console.error('Error adding to shopping list:', err);
        setAlert('Failed to add to shopping list', 'error');
      }
    }
  };
  
  // Handle adding an ingredient to shopping list
  const handleAddIngredientToShoppingList = async (ingredient) => {
    if (!activeShoppingList) {
      // Create a new shopping list if none exists
      try {
        setLoadingShoppingList(true);
        
        const newListRes = await axios.post('/api/shopping-lists', {
          name: 'Shopping List ' + new Date().toLocaleDateString(),
          description: 'Automatically created from search'
        });
        
        setActiveShoppingList(newListRes.data);
        
        // Now add the ingredient to the new list
        await axios.post(`/api/shopping-lists/${newListRes.data._id}/add-ingredient/${ingredient._id}`);
        
        setAlert('Created new shopping list and added ingredient', 'success');
      } catch (err) {
        console.error('Error creating shopping list:', err);
        setAlert('Failed to create shopping list', 'error');
      } finally {
        setLoadingShoppingList(false);
      }
    } else {
      // Add to existing active list
      try {
        await axios.post(`/api/shopping-lists/${activeShoppingList._id}/add-ingredient/${ingredient._id}`);
        setAlert('Added to shopping list', 'success');
      } catch (err) {
        console.error('Error adding to shopping list:', err);
        setAlert('Failed to add to shopping list', 'error');
      }
    }
  };
  
  // Get supermarket name by ID
  const getSupermarketName = (id) => {
    const supermarket = supermarkets.find(s => s._id === id);
    return supermarket ? supermarket.name : 'Unknown';
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Ingredient & Price Search
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Search for ingredients, supermarket products, or compare prices across stores
          </Typography>
        </Box>
        
        {/* Shopping List Status */}
        {!loadingShoppingList && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
            {activeShoppingList ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingCartIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Box>
                    <Typography variant="subtitle1">
                      Active Shopping List: {activeShoppingList.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeShoppingList.items.length} items, total: ${activeShoppingList.totalCost.toFixed(2)} AUD
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to={`/shopping/lists/${activeShoppingList._id}`}
                >
                  View List
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingCartIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="subtitle1" color="text.secondary">
                    No active shopping list
                  </Typography>
                </Box>
                <Button 
                  variant="outlined"
                  component={Link}
                  to="/shopping/lists/new"
                >
                  Create Shopping List
                </Button>
              </Box>
            )}
          </Paper>
        )}
        
        {/* Search Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab label="Ingredients" icon={<StorefrontIcon />} iconPosition="start" />
            <Tab label="Supermarket Products" icon={<StoreIcon />} iconPosition="start" />
            <Tab label="Price Comparison" icon={<SearchIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        
        {/* Search Form */}
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={selectedTab === 1 ? 6 : 12}>
              <TextField
                fullWidth
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                placeholder={
                  selectedTab === 0 ? "Search ingredients..." : 
                  selectedTab === 1 ? "Search supermarket products..." :
                  "Enter product name for price comparison..."
                }
              />
            </Grid>
            
            {selectedTab === 1 && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Supermarket</InputLabel>
                  <Select
                    value={selectedSupermarket}
                    onChange={(e) => setSelectedSupermarket(e.target.value)}
                    label="Select Supermarket"
                  >
                    <MenuItem value="">All Supermarkets</MenuItem>
                    {supermarkets.map(supermarket => (
                      <MenuItem key={supermarket._id} value={supermarket._id}>
                        {supermarket.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SearchIcon />}
                disabled={loading}
                sx={{ minWidth: 150 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
            </Grid>
          </Grid>
        </form>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Search Results */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Ingredient Results */}
            {selectedTab === 0 && ingredientResults.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Ingredient Results ({ingredientResults.length})
                </Typography>
                <Grid container spacing={3}>
                  {ingredientResults.map(ingredient => (
                    <Grid item xs={12} md={6} lg={4} key={ingredient._id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="div" gutterBottom>
                            {ingredient.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {ingredient.category.charAt(0).toUpperCase() + ingredient.category.slice(1)}
                          </Typography>
                          
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2">
                              Default Price: ${ingredient.purchasePrice.toFixed(2)} per {ingredient.purchaseUnit}
                            </Typography>
                            
                            {ingredient.prices && ingredient.prices.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="subtitle2">
                                  Available at:
                                </Typography>
                                {ingredient.prices.map((price, idx) => (
                                  <Chip
                                    key={idx}
                                    size="small"
                                    label={`${getSupermarketName(price.supermarket)}: $${price.price.toFixed(2)}`}
                                    sx={{ mr: 0.5, mt: 0.5 }}
                                    color={ingredient.preferredSupermarket === price.supermarket ? "primary" : "default"}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'space-between' }}>
                          <Button 
                            size="small" 
                            component={Link} 
                            to={`/ingredients/${ingredient._id}`}
                          >
                            View Details
                          </Button>
                          <Button
                            size="small"
                            startIcon={<AddShoppingCartIcon />}
                            onClick={() => handleAddIngredientToShoppingList(ingredient)}
                          >
                            Add to List
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
            {selectedTab === 0 && ingredientResults.length === 0 && searchTerm && !loading && (
              <Alert severity="info">
                No ingredients found matching "{searchTerm}". Try a different search term or check the spelling.
              </Alert>
            )}
            
            {/* Supermarket Product Results */}
            {selectedTab === 1 && productResults.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Product Results ({productResults.length})
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Supermarket</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Package Size</TableCell>
                        <TableCell>On Sale</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productResults.map(product => (
                        <TableRow key={product._id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="body1">{product.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {product.brand}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {product.supermarket?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {product.isOnSale && product.salePrice ? (
                              <Box>
                                <Typography 
                                  variant="body2" 
                                  sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                                >
                                  ${product.price.toFixed(2)}
                                </Typography>
                                <Typography variant="body1" color="error">
                                  ${product.salePrice.toFixed(2)}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body1">
                                ${product.price.toFixed(2)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{product.packageSize}</TableCell>
                          <TableCell>
                            {product.isOnSale ? (
                              <Chip 
                                label="ON SALE" 
                                color="error" 
                                size="small" 
                              />
                            ) : 'No'}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<AddShoppingCartIcon />}
                              onClick={() => handleAddToShoppingList(product)}
                            >
                              Add to List
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            
            {selectedTab === 1 && productResults.length === 0 && searchTerm && !loading && (
              <Alert severity="info">
                No products found matching "{searchTerm}". Try a different search term or check the spelling.
              </Alert>
            )}
            
            {/* Price Comparison Results */}
            {selectedTab === 2 && comparisonResults && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Price Comparison for "{comparisonResults.query}"
                </Typography>
                
                {comparisonResults.results.length > 0 ? (
                  <>
                    {comparisonResults.results.map((result, index) => (
                      <Card key={index} sx={{ mb: 3 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar 
                              sx={{ mr: 2 }}
                              src={result.supermarket.logoUrl}
                              alt={result.supermarket.name}
                            >
                              <StoreIcon />
                            </Avatar>
                            <Typography variant="h6">
                              {result.supermarket.name}
                            </Typography>
                          </Box>
                          
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Product</TableCell>
                                  <TableCell>Brand</TableCell>
                                  <TableCell>Package</TableCell>
                                  <TableCell>Price</TableCell>
                                  <TableCell>Unit Price</TableCell>
                                  <TableCell>Action</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {result.products.map(product => (
                                  <TableRow key={product._id}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.brand}</TableCell>
                                    <TableCell>{product.packageSize}</TableCell>
                                    <TableCell>
                                      {product.isOnSale && product.salePrice ? (
                                        <Box>
                                          <Typography 
                                            variant="body2" 
                                            sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                                          >
                                            ${product.price.toFixed(2)}
                                          </Typography>
                                          <Typography variant="body1" color="error">
                                            ${product.salePrice.toFixed(2)}
                                          </Typography>
                                        </Box>
                                      ) : (
                                        <Typography variant="body1">
                                          ${product.price.toFixed(2)}
                                        </Typography>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {/* Calculate unit price based on package size if possible */}
                                      {product.packageSize && product.packageSize.match(/\d+\s*([gml]|kg|L)/i) ? (
                                        (() => {
                                          const match = product.packageSize.match(/(\d+)\s*([gml]|kg|L)/i);
                                          if (match) {
                                            const size = parseInt(match[1]);
                                            const unit = match[2].toLowerCase();
                                            const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
                                            
                                            // Convert to per kg/L for meaningful comparison
                                            let unitPrice;
                                            if (unit === 'g') {
                                              unitPrice = (price / size) * 1000;
                                              return `$${unitPrice.toFixed(2)}/kg`;
                                            } else if (unit === 'ml') {
                                              unitPrice = (price / size) * 1000;
                                              return `$${unitPrice.toFixed(2)}/L`;
                                            } else if (unit === 'kg') {
                                              unitPrice = price / size;
                                              return `$${unitPrice.toFixed(2)}/kg`;
                                            } else if (unit === 'l') {
                                              unitPrice = price / size;
                                              return `$${unitPrice.toFixed(2)}/L`;
                                            }
                                          }
                                          return 'N/A';
                                        })()
                                      ) : (
                                        'N/A'
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        size="small"
                                        startIcon={<AddShoppingCartIcon />}
                                        onClick={() => handleAddToShoppingList(product)}
                                      >
                                        Add
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <Alert severity="info">
                    No matching products found across supermarkets for this search term.
                  </Alert>
                )}
              </Box>
            )}
            
            {selectedTab === 2 && !comparisonResults && searchTerm && !loading && (
              <Alert severity="info">
                Enter a product name and click Search to compare prices across supermarkets.
              </Alert>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default IngredientSearch;
