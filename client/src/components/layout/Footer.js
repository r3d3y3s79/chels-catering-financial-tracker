import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

const Footer = () => {
  return (
    <Box sx={{ 
      bgcolor: 'background.paper', 
      p: 6, 
      mt: 'auto',
      borderTop: '1px solid rgba(0, 0, 0, 0.12)'
    }} component="footer">
      <Typography variant="h6" align="center" gutterBottom>
        Catering Cost Management
      </Typography>
      <Typography
        variant="subtitle1"
        align="center"
        color="text.secondary"
        component="p"
      >
        Optimize your catering business finances
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        {'Copyright © '}
        <Link color="inherit" href="#">
          Catering Cost Manager
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    </Box>
  );
};

export default Footer;
