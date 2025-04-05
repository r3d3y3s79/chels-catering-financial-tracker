import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BarChartIcon from '@mui/icons-material/BarChart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/Logout';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import AuthContext from '../../context/auth/authContext';

const Navbar = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = authContext;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const onLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Ingredients', path: '/ingredients', icon: <RestaurantMenuIcon /> },
    { text: 'Recipes', path: '/recipes', icon: <RestaurantMenuIcon /> },
    { text: 'Menus', path: '/menus', icon: <RestaurantMenuIcon /> },
    { text: 'Purchases', path: '/purchases', icon: <ReceiptIcon /> }
  ];

  const mobileDrawerList = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      {isAuthenticated && user && (
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6">{user.name}</Typography>
          <Typography variant="body2">{user.email}</Typography>
        </Box>
      )}
      
      <List>
        {navLinks.map((link) => (
          <ListItem button key={link.text} component={Link} to={link.path}>
            <ListItemIcon>
              {link.icon}
            </ListItemIcon>
            <ListItemText primary={link.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button component={Link} to="/search">
          <ListItemIcon>
            <SearchIcon />
          </ListItemIcon>
          <ListItemText primary="Search Ingredients" />
        </ListItem>
        <ListItem button component={Link} to="/search/price-comparison">
          <ListItemIcon>
            <CompareArrowsIcon />
          </ListItemIcon>
          <ListItemText primary="Price Comparison" />
        </ListItem>
        <ListItem button component={Link} to="/shopping/lists">
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="Shopping Lists" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={() => navigate('/analysis/profitability')}>
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Profitability Analysis" />
        </ListItem>
        <ListItem button onClick={() => navigate('/analysis/costs')}>
          <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText primary="Cost Breakdown" />
        </ListItem>
        <ListItem button onClick={() => navigate('/analysis/pricing')}>
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Pricing Strategy" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={onLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  const authLinks = isMobile ? (
    <IconButton
      color="inherit"
      edge="end"
      aria-label="menu"
      onClick={toggleDrawer(true)}
    >
      <MenuIcon />
    </IconButton>
  ) : (
    <>
      <Button color="inherit" component={Link} to="/dashboard" startIcon={<DashboardIcon />}>
        Dashboard
      </Button>
      <Button color="inherit" component={Link} to="/ingredients">
        Ingredients
      </Button>
      <Button color="inherit" component={Link} to="/recipes">
        Recipes
      </Button>
      <Button color="inherit" component={Link} to="/menus">
        Menus
      </Button>
      <Button color="inherit" component={Link} to="/purchases">
        Purchases
      </Button>
      
      <Tooltip title="Search & Compare">
        <IconButton 
          color="inherit" 
          component={Link} 
          to="/search"
          size="large"
        >
          <SearchIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Price Comparison">
        <IconButton 
          color="inherit" 
          component={Link} 
          to="/search/price-comparison"
          size="large"
        >
          <CompareArrowsIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Shopping Lists">
        <IconButton 
          color="inherit"
          component={Link}
          to="/shopping/lists"
          size="large"
        >
          <Badge badgeContent={0} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <IconButton
        color="inherit"
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={() => { handleClose(); navigate('/analysis/profitability'); }}>
          Profitability Analysis
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); navigate('/analysis/costs'); }}>
          Cost Breakdown
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); navigate('/analysis/pricing'); }}>
          Pricing Strategy
        </MenuItem>
        <Divider />
        <MenuItem onClick={onLogout}>Logout</MenuItem>
      </Menu>
    </>
  );

  const guestLinks = (
    <>
      <Button color="inherit" component={Link} to="/login">
        Login
      </Button>
      <Button 
        variant="contained" 
        color="secondary" 
        component={Link} 
        to="/register"
        sx={{ ml: 1 }}
      >
        Register
      </Button>
    </>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <RestaurantMenuIcon sx={{ mr: 2 }} />
          <Typography 
            variant="h6" 
            component={Link} 
            to="/"
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Chel's Catering Ingredients Financial Tracker
          </Typography>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/"
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              display: { xs: 'block', sm: 'none' }
            }}
          >
            Chel's Catering
          </Typography>
          {isAuthenticated ? authLinks : guestLinks}
        </Toolbar>
      </AppBar>
      
      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {mobileDrawerList()}
      </Drawer>
    </Box>
  );
};

export default Navbar;