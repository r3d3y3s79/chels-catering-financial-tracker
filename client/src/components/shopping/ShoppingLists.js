import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PrintIcon from '@mui/icons-material/Print';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import AlertContext from '../../context/alert/alertContext';

const ShoppingLists = () => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;
  
  const [shoppingLists, setShoppingLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);
  
  // Load all shopping lists
  useEffect(() => {
    const getShoppingLists = async () => {
      try {
        const res = await axios.get('/api/shopping-lists');
        setShoppingLists(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching shopping lists:', err);
        setAlert('Failed to load shopping lists', 'error');
        setLoading(false);
      }
    };
    
    getShoppingLists();
  }, [setAlert]);
  
  // Handle completing a shopping list
  const handleCompleteList = async (id) => {
    try {
      const res = await axios.post(`/api/shopping-lists/${id}/complete`);
      
      // Update the list in state
      setShoppingLists(shoppingLists.map(list => 
        list._id === id ? res.data : list
      ));
      
      setAlert('Shopping list marked as completed', 'success');
    } catch (err) {
      console.error('Error completing shopping list:', err);
      setAlert('Failed to complete shopping list', 'error');
    }
  };
  
  // Handle deleting a shopping list
  const handleDeleteList = async () => {
    if (!listToDelete) return;
    
    try {
      await axios.delete(`/api/shopping-lists/${listToDelete}`);
      
      // Remove the list from state
      setShoppingLists(shoppingLists.filter(list => list._id !== listToDelete));
      
      setAlert('Shopping list deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setListToDelete(null);
    } catch (err) {
      console.error('Error deleting shopping list:', err);
      setAlert('Failed to delete shopping list', 'error');
      setDeleteDialogOpen(false);
      setListToDelete(null);
    }
  };
  
  // Open delete confirmation dialog
  const confirmDelete = (id) => {
    setListToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  // Cancel delete
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setListToDelete(null);
  };
  
  // Print shopping list
  const printShoppingList = (list) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Calculate list totals
    const totalCost = list.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const checkedItems = list.items.filter(item => item.isChecked);
    const checkedTotal = checkedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Generate HTML content
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shopping List - ${list.name}</title>
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
          <h1>Shopping List - ${list.name}</h1>
          <div class="no-print">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
        </div>
        
        <div class="info">
          ${list.description ? `<p>${list.description}</p>` : ''}
          <p>Date: ${new Date().toLocaleDateString()}</p>
          ${list.primarySupermarket ? `<p>Primary Supermarket: ${list.primarySupermarket.name}</p>` : ''}
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
            ${list.items.map(item => `
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
        
        <div class="total">
          <p>Total Items: ${list.items.length}</p>
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
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Shopping Lists
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/shopping/lists/new"
          >
            Create New List
          </Button>
        </Box>
        
        {shoppingLists.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Shopping Lists
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You haven't created any shopping lists yet. Create a new list to start tracking your purchases.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              component={Link}
              to="/shopping/lists/new"
            >
              Create First List
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {shoppingLists.map(list => (
              <Grid item xs={12} md={6} key={list._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {list.name}
                      </Typography>
                      <Chip 
                        icon={list.isActive ? <PendingIcon /> : <CheckCircleIcon />}
                        label={list.isActive ? 'Active' : 'Completed'}
                        color={list.isActive ? 'primary' : 'success'}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {list.description || 'No description'}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">
                        Created: {new Date(list.createdAt).toLocaleDateString()}
                      </Typography>
                      {list.completedDate && (
                        <Typography variant="subtitle2">
                          Completed: {new Date(list.completedDate).toLocaleDateString()}
                        </Typography>
                      )}
                      {list.primarySupermarket && (
                        <Typography variant="subtitle2">
                          Primary Store: {list.primarySupermarket.name}
                        </Typography>
                      )}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Items: {list.items.length}
                      </Typography>
                      
                      {list.items.length > 0 ? (
                        <>
                          <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
                            {list.items.slice(0, 5).map((item, index) => (
                              <ListItem key={index} dense divider={index < Math.min(4, list.items.length - 1)}>
                                <ListItemText
                                  primary={item.name}
                                  secondary={`${item.quantity} ${item.unit} - $${(item.price * item.quantity).toFixed(2)}`}
                                  primaryTypographyProps={{
                                    style: { 
                                      textDecoration: item.isChecked ? 'line-through' : 'none',
                                      color: item.isChecked ? 'text.secondary' : 'text.primary'
                                    }
                                  }}
                                />
                              </ListItem>
                            ))}
                            {list.items.length > 5 && (
                              <ListItem>
                                <ListItemText 
                                  primary={`... and ${list.items.length - 5} more items`}
                                  primaryTypographyProps={{ style: { fontStyle: 'italic', color: 'text.secondary' } }}
                                />
                              </ListItem>
                            )}
                          </List>
                          
                          <Box sx={{ mt: 2, textAlign: 'right' }}>
                            <Typography variant="subtitle1">
                              Total: ${list.totalCost.toFixed(2)} AUD
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          This list is empty. Add items to get started.
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box>
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        component={Link}
                        to={`/shopping/lists/${list._id}`}
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={() => printShoppingList(list)}
                      >
                        Print
                      </Button>
                    </Box>
                    <Box>
                      {list.isActive && (
                        <Button
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleCompleteList(list._id)}
                          sx={{ mr: 1 }}
                        >
                          Complete
                        </Button>
                      )}
                      <IconButton 
                        color="error"
                        onClick={() => confirmDelete(list._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={cancelDelete}
        >
          <DialogTitle>Delete Shopping List?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this shopping list? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDelete}>Cancel</Button>
            <Button onClick={handleDeleteList} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default ShoppingLists;
