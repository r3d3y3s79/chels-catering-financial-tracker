import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SearchIcon from '@mui/icons-material/Search';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SavingsIcon from '@mui/icons-material/Savings';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import StoreIcon from '@mui/icons-material/Store';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

import AlertContext from '../../context/alert/alertContext';

const PriceComparison = () => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  const [supermarkets, setSupermarkets] = useState([]);
  const [supermarketsLoading, setSupermarketsLoading] = useState(true);
  
  const [comparison, setComparison] = useState(null);
  const [bestDeals, setBestDeals] = useState([]);
  const [bestDealsLoading, setBestDealsLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState([]);
  const [priceHistoryLoading, setPriceHistoryLoading] = useState(false);
  
  const [activeShoppingList, setActiveShoppingList] = useState(null);
  const [loadingShoppingList, setLoadingShoppingList] = useState(true);
  
  const [selectedSupermarket, setSelectedSupermarket] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Load supermarkets and active shopping list on mount
  useEffect(() => {
    const getSupermarkets = async () => {
      try {
        const res = await axios.get('/api/supermarkets');
        setSupermarkets(res.data);
        setSupermarketsLoading(false);
      } catch (err) {
        console.error('Error fetching supermarkets:', err);
        setSupermarketsLoading(false);
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
    
    // Load best deals on mount
    getBestDeals();
  }, []);
  
  // Get best deals - items on sale or with significant price drops
  const getBestDeals = async () => {
    setBestDealsLoading(true);
    
    try {
      // In a real app, this would be an actual API endpoint
      // For demo, we'll simulate with mock data
      setTimeout(() => {
        const mockDeals = [
          {
            _id: '1',
            name: 'Chicken Breast Fillets',
            brand: 'Coles',
            supermarket: { _id: '2', name: 'Coles' },
            price: 13.75,
            isOnSale: true,
            salePrice: 9.90,
            packageSize: '1kg',
            saleEndDate: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)), // 3 days from now
            priceDropPercentage: 28
          },
          {
            _id: '2',
            name: 'Rice Basmati',
            brand: 'SunRice',
            supermarket: { _id: '3', name: 'Aldi' },
            price: 6.49,
            isOnSale: true,
            salePrice: 4.99,
            packageSize: '1kg',
            saleEndDate: new Date(Date.now() + (5 * 24 * 60 * 60 * 1000)), // 5 days from now
            priceDropPercentage: 23
          },
          {
            _id: '3',
            name: 'Eggs Free Range 12pk',
            brand: 'Farm Fresh',
            supermarket: { _id: '3', name: 'Aldi' },
            price: 5.20,
            isOnSale: true,
            salePrice: 4.50,
            packageSize: '12 eggs',
            saleEndDate: new Date(Date.now() + (2 * 24 * 60 * 60 * 1000)), // 2 days from now
            priceDropPercentage: 13
          },
          {
            _id: '4',
            name: 'Pasta Spaghetti',
            brand: 'Barilla',
            supermarket: { _id: '1', name: 'Woolworths' },
            price: 3.50,
            isOnSale: true,
            salePrice: 2.80,
            packageSize: '500g',
            saleEndDate: new Date(Date.now() + (1 * 24 * 60 * 60 * 1000)), // 1 day from now
            priceDropPercentage: 20
          },
          {
            _id: '5',
            name: 'Milk Full Cream',
            brand: 'Woolworths Homebrand',
            supermarket: { _id: '1', name: 'Woolworths' },
            price: 3.10,
            isOnSale: false,
            packageSize: '2L',
            priceHistory: [
              { price: 3.30, date: new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)) },
              { price: 3.25, date: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)) },
              { price: 3.10, date: new Date() }
            ],
            priceDropPercentage: 6
          }
        ];
        
        setBestDeals(mockDeals);
        setBestDealsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching best deals:', err);
      setBestDealsLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Search for product price comparison
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setAlert('Please enter a search term', 'error');
      return;
    }
    
    setSearching(true);
    
    try {
      const res = await axios.get(`/api/supermarket-products/compare/${searchTerm.trim()}`);
      setComparison(res.data);
      setSearching(false);
      
      // If we have results, show them automatically
      if (res.data.results && res.data.results.length > 0) {
        setActiveTab(1);
      }
    } catch (err) {
      console.error('Error searching products:', err);
      setAlert('Error performing search', 'error');
      setSearching(false);
    }
  };
  
  // Get price history for a product
  const getProductPriceHistory = async (productId) => {
    setSelectedProduct(productId);
    setPriceHistoryLoading(true);
    
    try {
      // In a real app, this would be an API endpoint
      // For now, simulate with mock data
      setTimeout(() => {
        // Generate random history data
        const today = new Date();
        const historyData = [];
        
        // Generate 10 data points going back in time
        for (let i = 10; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - (i * 7)); // Weekly data points
          
          const basePrice = 5 + Math.random() * 2; // Random price between 5 and 7
          
          historyData.push({
            date: date.toISOString().split('T')[0],
            price: parseFloat(basePrice.toFixed(2))
          });
        }
        
        setPriceHistory(historyData);
        setPriceHistoryLoading(false);
      }, 800);
    } catch (err) {
      console.error('Error fetching price history:', err);
      setPriceHistoryLoading(false);
    }
  };
  
  // Add product to shopping list
  const addToShoppingList = async (product) => {
    if (!activeShoppingList) {
      // Create new shopping list first
      try {
        setLoadingShoppingList(true);
        
        const newListRes = await axios.post('/api/shopping-lists', {
          name: 'Shopping List ' + new Date().toLocaleDateString(),
          description: 'Created from price comparison'
        });
        
        setActiveShoppingList(newListRes.data);
        
        // Now add product to the new list
        await axios.post(`/api/shopping-lists/${newListRes.data._id}/add-product/${product._id}`);
        
        setAlert('Created new shopping list and added product', 'success');
        setLoadingShoppingList(false);
      } catch (err) {
        console.error('Error creating shopping list:', err);
        setAlert('Failed to create shopping list', 'error');
        setLoadingShoppingList(false);
      }
    } else {
      // Add to existing list
      try {
        await axios.post(`/api/shopping-lists/${activeShoppingList._id}/add-product/${product._id}`);
        setAlert('Added to shopping list', 'success');
      } catch (err) {
        console.error('Error adding to shopping list:', err);
        setAlert('Failed to add to shopping list', 'error');
      }
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  
  // Calculate days remaining until a date
  const getDaysRemaining = (dateString) => {
    const today = new Date();
    const endDate = new Date(dateString);
    
    // Set time to beginning of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Price Comparison Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Compare prices across different supermarkets, find the best deals, and track price changes over time.
        </Typography>
        
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
        
        {/* Search Bar */}
        <Paper 
          component="form" 
          sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}
          elevation={1}
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={selectedSupermarket ? 8 : 10}>
              <TextField
                fullWidth
                label="Compare Prices Across Supermarkets"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter product name (e.g., milk, chicken breast, rice)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CompareArrowsIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            {!supermarketsLoading && (
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Store Filter</InputLabel>
                  <Select
                    value={selectedSupermarket}
                    onChange={(e) => setSelectedSupermarket(e.target.value)}
                    label="Store Filter"
                  >
                    <MenuItem value="">All Stores</MenuItem>
                    {supermarkets.map(supermarket => (
                      <MenuItem key={supermarket._id} value={supermarket._id}>
                        {supermarket.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} md={selectedSupermarket ? 2 : 2}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={searching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                disabled={searching || !searchTerm.trim()}
                type="submit"
                sx={{ height: '56px' }}
              >
                Compare
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Tabs for different sections */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            aria-label="price comparison tabs"
          >
            <Tab 
              icon={<LocalOfferIcon />} 
              iconPosition="start" 
              label="Best Deals" 
            />
            {comparison && (
              <Tab 
                icon={<CompareArrowsIcon />} 
                iconPosition="start" 
                label={`Compare: ${comparison.query}`} 
              />
            )}
            {selectedProduct && (
              <Tab 
                icon={<TrendingDownIcon />} 
                iconPosition="start" 
                label="Price History" 
              />
            )}
          </Tabs>
        </Box>
        
        {/* Tab Content */}
        <Box sx={{ py: 3 }}>
          {/* Best Deals Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SavingsIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Best Deals & Price Drops
                </Typography>
              </Box>
              
              {bestDealsLoading ? (
                <Grid container spacing={3}>
                  {[1, 2, 3, 4].map(i => (
                    <Grid item xs={12} md={6} key={i}>
                      <Card>
                        <CardContent>
                          <Skeleton variant="text" width="60%" height={40} />
                          <Skeleton variant="text" width="40%" />
                          <Box sx={{ mt: 2 }}>
                            <Skeleton variant="rectangular" height={120} />
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Skeleton variant="text" width={120} height={40} />
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : bestDeals.length > 0 ? (
                <Grid container spacing={3}>
                  {bestDeals.map(deal => (
                    <Grid item xs={12} md={6} key={deal._id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="h6" component="div">
                                {deal.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {deal.brand} - {deal.packageSize}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, mr: 1 }}>
                                <StoreIcon fontSize="small" />
                              </Avatar>
                              <Typography variant="body2">
                                {deal.supermarket.name}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ mt: 2, mb: 1 }}>
                            {deal.isOnSale ? (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                    Was: ${deal.price.toFixed(2)}
                                  </Typography>
                                  <Typography variant="h6" color="error">
                                    Now: ${deal.salePrice.toFixed(2)}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={`Save ${deal.priceDropPercentage}%`}
                                  color="error"
                                  sx={{ ml: 2 }}
                                />
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h6">
                                  ${deal.price.toFixed(2)}
                                </Typography>
                                <Chip 
                                  label={`Price Drop ${deal.priceDropPercentage}%`}
                                  color="info"
                                  sx={{ ml: 2 }}
                                />
                              </Box>
                            )}
                          </Box>
                          
                          {deal.isOnSale && deal.saleEndDate && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                              Sale ends in {getDaysRemaining(deal.saleEndDate)} days
                            </Alert>
                          )}
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small"
                            onClick={() => getProductPriceHistory(deal._id)}
                          >
                            View Price History
                          </Button>
                          <Button
                            size="small"
                            startIcon={<AddShoppingCartIcon />}
                            onClick={() => addToShoppingList(deal)}
                          >
                            Add to List
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">
                  No deals or price drops found at the moment. Please check again later.
                </Alert>
              )}
            </Box>
          )}
          
          {/* Comparison Results Tab */}
          {activeTab === 1 && comparison && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CompareArrowsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Price Comparison for "{comparison.query}"
                </Typography>
              </Box>
              
              {comparison.results.length === 0 ? (
                <Alert severity="info">
                  No matching products found across supermarkets for this search term.
                </Alert>
              ) : (
                <>
                  {/* Price Comparison Chart */}
                  <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Price Comparison by Supermarket
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={comparison.results.map(result => ({
                            name: result.supermarket.name,
                            price: result.products[0]?.price || 0,
                            salePrice: result.products[0]?.isOnSale ? result.products[0].salePrice : null
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis
                            label={{ value: 'Price (AUD)', angle: -90, position: 'insideLeft' }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip formatter={(value) => [`$${value}`, 'Price']} />
                          <Legend />
                          <Bar dataKey="price" name="Regular Price" fill="#8884d8" />
                          <Bar dataKey="salePrice" name="Sale Price" fill="#ff5252" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                  
                  {/* Supermarket Results */}
                  {comparison.results.map((result, index) => (
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
                                <TableCell>Actions</TableCell>
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
                                      onClick={() => getProductPriceHistory(product._id)}
                                    >
                                      History
                                    </Button>
                                    <Button
                                      size="small"
                                      startIcon={<AddShoppingCartIcon />}
                                      onClick={() => addToShoppingList(product)}
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
              )}
            </Box>
          )}
          
          {/* Price History Tab */}
          {activeTab === 2 && selectedProduct && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingDownIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Price History
                </Typography>
              </Box>
              
              {priceHistoryLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : priceHistory.length > 0 ? (
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={priceHistory}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          label={{ value: 'Date', position: 'insideBottomRight', offset: -10 }}
                        />
                        <YAxis
                          label={{ value: 'Price (AUD)', angle: -90, position: 'insideLeft' }}
                          tickFormatter={(value) => `$${value}`}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip formatter={(value) => [`$${value}`, 'Price']} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#4caf50" 
                          activeDot={{ r: 8 }} 
                          name="Price (AUD)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Price Analysis
                    </Typography>
                    
                    {(() => {
                      if (priceHistory.length < 2) return null;
                      
                      const firstPrice = priceHistory[0].price;
                      const currentPrice = priceHistory[priceHistory.length - 1].price;
                      const changeAmount = currentPrice - firstPrice;
                      const changePercent = (changeAmount / firstPrice) * 100;
                      
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {changeAmount < 0 ? (
                            <TrendingDownIcon color="success" sx={{ mr: 1 }} />
                          ) : (
                            <TrendingUpIcon color="error" sx={{ mr: 1 }} />
                          )}
                          <Typography variant="body1">
                            {changeAmount < 0 ? 'Price decreased by ' : 'Price increased by '}
                            ${Math.abs(changeAmount).toFixed(2)} ({Math.abs(changePercent).toFixed(1)}%)
                            {' over the last '}
                            {priceHistory.length - 1} 
                            {' data points.'}
                          </Typography>
                        </Box>
                      );
                    })()}
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Lowest price: ${Math.min(...priceHistory.map(p => p.price)).toFixed(2)} on {
                          formatDate(priceHistory.find(p => p.price === Math.min(...priceHistory.map(p => p.price))).date)
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Highest price: ${Math.max(...priceHistory.map(p => p.price)).toFixed(2)} on {
                          formatDate(priceHistory.find(p => p.price === Math.max(...priceHistory.map(p => p.price))).date)
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average price: ${(priceHistory.reduce((sum, p) => sum + p.price, 0) / priceHistory.length).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ) : (
                <Alert severity="info">
                  No price history data available for this product.
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default PriceComparison;
