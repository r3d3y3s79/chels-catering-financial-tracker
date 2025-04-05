import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PrintIcon from '@mui/icons-material/Print';
import StoreIcon from '@mui/icons-material/Store';
import SearchIcon from '@mui/icons-material/Search';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Alert from '@mui/material/Alert';

import AlertContext from '../../context/alert/alertContext';

const ShoppingListDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;
  
  const [shoppingList, setShoppingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supermarkets, setSupermarkets] = useState([]);
  const [supermarketsLoading, setSupermarketsLoading] = useState(true);
  
  // Dialog states
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [editListDialogOpen, setEditListDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSupermarket, setSelectedSupermarket] = useState('');
  
  // Form states
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: '',
    price: '',
    supermarket: '',
    notes: ''
  });
  
  const [editingItem, setEditingItem] = useState({
    _id: '',
    name: '',
    quantity: 1,
    unit: '',
    price: '',
    supermarket: '',
    notes: '',
    isChecked: false
  });
  
  const [listDetails, setListDetails] = useState({
    name: '',
    description: '',
    primarySupermarket: ''
  });
  
  // Load shopping list and supermarkets
  useEffect(() => {
    const getShoppingList = async () => {
      try {
        const res = await axios.get(`/api/shopping-lists/${id}`);
        setShoppingList(res.data);
        setListDetails({
          name: res.data.name,
          description: res.data.description || '',
          primarySupermarket: res.data.primarySupermarket?._id || ''
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching shopping list:', err);
        setAlert('Failed to load shopping list', 'error');
        setLoading(false);
        navigate('/shopping/lists');
      }
    };
    
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
    
    getShoppingList();
    getSupermarkets();
  }, [id, navigate, setAlert]);
  
  // Toggle item checked status
  const toggleItemChecked = async (itemId, currentStatus) => {
    try {
      const res = await axios.put(`/api/shopping-lists/${id}/items/${itemId}`, {
        isChecked: !currentStatus
      });
      
      setShoppingList(res.data);
    } catch (err) {
      console.error('Error updating item:', err);
      setAlert('Failed to update item status', 'error');
    }
  };
  
  // Delete item from list
  const deleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item from the list?')) {
      try {
        const res = await axios.delete(`/api/shopping-lists/${id}/items/${itemId}`);
        setShoppingList(res.data);
        setAlert('Item removed from shopping list', 'success');
      } catch (err) {
        console.error('Error removing item:', err);
        setAlert('Failed to remove item', 'error');
      }
    }
  };
  
  // Edit item - open dialog with item data
  const openEditItemDialog = (item) => {
    setEditingItem({
      _id: item._id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      supermarket: item.supermarket || '',
      notes: item.notes || '',
      isChecked: item.isChecked
    });
    setEditItemDialogOpen(true);
  };
  
  // Save edited item
  const saveEditedItem = async () => {
    try {
      const res = await axios.put(`/api/shopping-lists/${id}/items/${editingItem._id}`, {
        quantity: editingItem.quantity,
        notes: editingItem.notes,
        isChecked: editingItem.isChecked
      });
      
      setShoppingList(res.data);
      setEditItemDialogOpen(false);
      setAlert('Item updated successfully', 'success');
    } catch (err) {
      console.error('Error updating item:', err);
      setAlert('Failed to update item', 'error');
      setEditItemDialogOpen(false);
    }
  };
  
  // Add new item to list
  const addNewItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.unit) {
      setAlert('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      const res = await axios.post(`/api/shopping-lists/${id}/items`, {
        name: newItem.name,
        quantity: newItem.quantity,
        unit: newItem.unit,
        price: parseFloat(newItem.price),
        supermarket: newItem.supermarket,
        notes: newItem.notes
      });
      
      setShoppingList(res.data);
      setAddItemDialogOpen(false);
      setAlert('Item added to shopping list', 'success');
      
      // Reset form
      setNewItem({
        name: '',
        quantity: 1,
        unit: '',
        price: '',
        supermarket: '',
        notes: ''
      });
    } catch (err) {
      console.error('Error adding item:', err);
      setAlert('Failed to add item', 'error');
    }
  };
  
  // Update list details
  const updateListDetails = async () => {
    try {
      const res = await axios.put(`/api/shopping-lists/${id}`, {
        name: listDetails.name,
        description: listDetails.description,
        primarySupermarket: listDetails.primarySupermarket
      });
      
      setShoppingList(res.data);
      setEditListDialogOpen(false);
      setAlert('Shopping list updated successfully', 'success');
    } catch (err) {
      console.error('Error updating list:', err);
      setAlert('Failed to update shopping list', 'error');
      setEditListDialogOpen(false);
    }
  };
  
  // Mark list as complete
  const completeList = async () => {
    try {
      const res = await axios.post(`/api/shopping-lists/${id}/complete`);
      setShoppingList(res.data);
      setAlert('Shopping list marked as completed', 'success');
    } catch (err) {
      console.error('Error completing list:', err);
      setAlert('Failed to complete shopping list', 'error');
    }
  };
  
  // Search products by name
  const searchProducts = async () => {
    if (!searchTerm.trim()) {
      setAlert('Please enter a search term', 'error');
      return;
    }
    
    setSearchLoading(true);
    
    try {
      const res = await axios.get(`/api/supermarket-products/search/${searchTerm.trim()}`, {
        params: { supermarket: selectedSupermarket }
      });
      
      setSearchResults(res.data);
      setSearchLoading(false);
    } catch (err) {
      console.error('Error searching products:', err);
      setAlert('Error performing search', 'error');
      setSearchLoading(false);
    }
  };
  
  // Add product to shopping list
  const addProductToList = async (product) => {
    try {
      const res = await axios.post(`/api/shopping-lists/${id}/add-product/${product._id}`);
      setShoppingList(res.data);
      setAlert('Product added to shopping list', 'success');
    } catch (err) {
      console.error('Error adding product to list:', err);
      setAlert('Failed to add product to list', 'error');
    }
  };
  
  // Print shopping list
  const printShoppingList = () => {
    if (!shoppingList) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Calculate list totals
    const totalCost = shoppingList.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const checkedItems = shoppingList.items.filter(item => item.isChecked);
    const checkedTotal = checkedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Group items by supermarket
    const itemsByStore = {};
    shoppingList.items.forEach(item => {
      const storeId = item.supermarket || 'other';
      const storeName = item.supermarket ? 
        supermarkets.find(s => s._id === item.supermarket)?.name || 'Unknown' : 
        'Not Specified';
      
      if (!itemsByStore[storeId]) {
        itemsByStore[storeId] = {
          name: storeName,
          items: []
        };
      }
      
      itemsByStore[storeId].items.push(item);
    });
    
    // Generate HTML content
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shopping List - ${shoppingList.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
          }
          h1 {
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .info {
            margin-bottom: 20px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f2f2f2;
          }
          .store-section {
            margin-bottom: 30px;
          }
          .store-header {
            background-color: #f9f9f9;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 10px;
            font-weight: bold;
          }
          .total {
            text-align: right;
            font-weight: bold;
            margin-top: 20px;
            border-top: 2px solid #000;
            padding-top: 10px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Shopping List - ${shoppingList.name}</h1>
          <div class="no-print">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
        </div>
        
        <div class="info">
          ${shoppingList.description ? `<p>${shoppingList.description}</p>` : ''}
          <p>Date: ${new Date().toLocaleDateString()}</p>
          ${shoppingList.primarySupermarket ? `<p>Primary Supermarket: ${shoppingList.primarySupermarket.name}</p>` : ''}
        </div>
        
        ${Object.values(itemsByStore).map(store => `
          <div class="store-section">
            <div class="store-header">
              ${store.name}
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${store.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unit}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
        
        <div class="total">
          <p>Total Items: ${shoppingList.items.length}</p>
          <p>Total Cost: $${totalCost.toFixed(2)} AUD</p>
        </div>
        
        <div class="footer">
          <p>Printed from Catering Cost Management App</p>
        </div>
      </body>
      </html>
    `;
    
    // Write to the window and trigger print
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Give the browser a moment to load the content before printing
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
  
  // Get supermarket name by ID
  const getSupermarketName = (id) => {
    if (!id) return 'Not specified';
    const supermarket = supermarkets.find(s => s._id === id);
    return supermarket ? supermarket.name : 'Unknown';
  };
  
  if (loading || supermarketsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!shoppingList) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Shopping List Not Found
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            The requested shopping list could not be found or has been deleted.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            component={Link}
            to="/shopping/lists"
          >
            Back to Shopping Lists
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            component={Link}
            to="/shopping/lists"
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            {shoppingList.name}
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={printShoppingList}
              sx={{ mr: 1 }}
            >
              Print
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditListDialogOpen(true)}
            >
              Edit
            </Button>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          {/* List Info */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  List Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    icon={shoppingList.isActive ? <ShoppingCartIcon /> : <CheckCircleIcon />}
                    label={shoppingList.isActive ? 'Active' : 'Completed'}
                    color={shoppingList.isActive ? 'primary' : 'success'}
                    size="small"
                  />
                </Box>
                
                {shoppingList.description && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {shoppingList.description}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(shoppingList.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                
                {shoppingList.completedDate && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                    <Typography variant="body1">
                      {new Date(shoppingList.completedDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
                
                {shoppingList.primarySupermarket && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Primary Supermarket
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                        <StoreIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body1">
                        {shoppingList.primarySupermarket.name}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Shopping Summary
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Items:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {shoppingList.items.length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Items Checked:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {shoppingList.items.filter(item => item.isChecked).length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Cost:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      ${shoppingList.totalCost.toFixed(2)} AUD
                    </Typography>
                  </Box>
                </Box>
                
                {shoppingList.isActive && (
                  <Box sx={{ mt: 3 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={completeList}
                    >
                      Mark List as Complete
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* List Items */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Shopping Items
                  </Typography>
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<SearchIcon />}
                      onClick={() => setSearchDialogOpen(true)}
                      sx={{ mr: 1 }}
                    >
                      Product Search
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setAddItemDialogOpen(true)}
                      disabled={!shoppingList.isActive}
                    >
                      Add Item
                    </Button>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {shoppingList.items.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No Items in List
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      This shopping list is empty. Add items to get started.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setAddItemDialogOpen(true)}
                      disabled={!shoppingList.isActive}
                    >
                      Add First Item
                    </Button>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox"></TableCell>
                          <TableCell>Item</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Store</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {shoppingList.items.map(item => (
                          <TableRow key={item._id} sx={{
                            textDecoration: item.isChecked ? 'line-through' : 'none',
                            color: item.isChecked ? 'text.secondary' : 'text.primary',
                            backgroundColor: item.isChecked ? 'action.hover' : 'inherit'
                          }}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={item.isChecked}
                                onChange={() => toggleItemChecked(item._id, item.isChecked)}
                                disabled={!shoppingList.isActive}
                              />
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body1">{item.name}</Typography>
                                {item.notes && (
                                  <Typography variant="body2" color="text.secondary">
                                    {item.notes}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>{item.quantity} {item.unit}</TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                            <TableCell>
                              {item.supermarket ? getSupermarketName(item.supermarket) : 'Not specified'}
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Edit Item">
                                <IconButton
                                  size="small"
                                  onClick={() => openEditItemDialog(item)}
                                  disabled={!shoppingList.isActive}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Remove Item">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => deleteItem(item._id)}
                                  disabled={!shoppingList.isActive}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Add Item Dialog */}
        <Dialog
          open={addItemDialogOpen}
          onClose={() => setAddItemDialogOpen(false)}
        >
          <DialogTitle>Add New Item</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Item Name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  required
                  InputProps={{
                    inputProps: { min: 1 }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Unit"
                  placeholder="kg, L, pack, etc."
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Price per Unit"
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: 0, step: 0.01 }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Supermarket</InputLabel>
                  <Select
                    value={newItem.supermarket}
                    onChange={(e) => setNewItem({ ...newItem, supermarket: e.target.value })}
                    label="Supermarket"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {supermarkets.map(supermarket => (
                      <MenuItem key={supermarket._id} value={supermarket._id}>
                        {supermarket.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddItemDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={addNewItem}
            >
              Add Item
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Edit Item Dialog */}
        <Dialog
          open={editItemDialogOpen}
          onClose={() => setEditItemDialogOpen(false)}
        >
          <DialogTitle>Edit Item</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Item Name"
                  value={editingItem.name}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={editingItem.quantity}
                  onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
                  required
                  InputProps={{
                    inputProps: { min: 1 }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Unit"
                  value={editingItem.unit}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Price per Unit"
                  type="number"
                  value={editingItem.price}
                  disabled
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Supermarket"
                  value={getSupermarketName(editingItem.supermarket)}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={editingItem.notes}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <label htmlFor="isChecked">
                    <Checkbox
                      id="isChecked"
                      checked={editingItem.isChecked}
                      onChange={(e) => setEditingItem({ ...editingItem, isChecked: e.target.checked })}
                    />
                    Mark as checked
                  </label>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditItemDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={saveEditedItem}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Edit List Dialog */}
        <Dialog
          open={editListDialogOpen}
          onClose={() => setEditListDialogOpen(false)}
        >
          <DialogTitle>Edit Shopping List</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="List Name"
                  value={listDetails.name}
                  onChange={(e) => setListDetails({ ...listDetails, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={listDetails.description}
                  onChange={(e) => setListDetails({ ...listDetails, description: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Primary Supermarket</InputLabel>
                  <Select
                    value={listDetails.primarySupermarket}
                    onChange={(e) => setListDetails({ ...listDetails, primarySupermarket: e.target.value })}
                    label="Primary Supermarket"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {supermarkets.map(supermarket => (
                      <MenuItem key={supermarket._id} value={supermarket._id}>
                        {supermarket.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditListDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={updateListDetails}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Product Search Dialog */}
        <Dialog
          open={searchDialogOpen}
          onClose={() => setSearchDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Search for Products</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0, mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search Products"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter product name..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Supermarket</InputLabel>
                  <Select
                    value={selectedSupermarket}
                    onChange={(e) => setSelectedSupermarket(e.target.value)}
                    label="Supermarket"
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
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={searchProducts}
                  disabled={searchLoading}
                  sx={{ height: '56px' }}
                >
                  {searchLoading ? <CircularProgress size={24} /> : 'Search'}
                </Button>
              </Grid>
            </Grid>
            
            {searchLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : searchResults.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Supermarket</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Package</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchResults.map(product => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body1">{product.name}</Typography>
                            {product.brand && (
                              <Typography variant="body2" color="text.secondary">
                                {product.brand}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{product.supermarket?.name || 'Unknown'}</TableCell>
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
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => addProductToList(product)}
                          >
                            Add to List
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : searchTerm && !searchLoading ? (
              <Alert severity="info">
                No products found matching "{searchTerm}". Try a different search term or check the spelling.
              </Alert>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <StorefrontIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  Enter a search term to find products
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSearchDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default ShoppingListDetail;
