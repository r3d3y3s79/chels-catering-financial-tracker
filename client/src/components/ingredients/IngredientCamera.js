import React, { useState, useRef, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import axios from 'axios';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import AlertContext from '../../context/alert/alertContext';

const IngredientCamera = () => {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;
  
  const [capturing, setCapturing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front camera
  const [extractedData, setExtractedData] = useState(null);
  const [manualInput, setManualInput] = useState({
    name: '',
    price: ''
  });
  
  // Capture image from camera
  const handleCapture = useCallback(() => {
    setCapturing(true);
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    setCapturing(false);
    
    // Process the captured image
    processImage(imageSrc);
  }, [webcamRef]);
  
  // Switch between front and back camera
  const handleFlipCamera = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
  };
  
  // Process the captured image with OCR
  const processImage = async (imageSrc) => {
    setProcessing(true);
    
    try {
      // Convert base64 image to file
      const file = dataURLtoFile(imageSrc, 'price_tag.jpg');
      
      // Create form data for the API request
      const formData = new FormData();
      formData.append('image', file);
      
      // Send to OCR API
      const response = await axios.post('/api/ingredients/ocr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setExtractedData(response.data.parsedData);
        setManualInput({
          name: response.data.parsedData.name || '',
          price: response.data.parsedData.purchasePrice ? response.data.parsedData.purchasePrice.toString() : ''
        });
        setAlert('Price tag scanned successfully', 'success');
      } else {
        setAlert('Could not extract information from the image', 'error');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setAlert('Error processing image. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
  };
  
  // Helper function to convert base64 to file
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  };
  
  // Handle manual input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setManualInput({ ...manualInput, [name]: value });
  };
  
  // Continue to ingredient form with the extracted/manual data
  const handleContinue = () => {
    // Check if we have at least a name and a price
    if (!manualInput.name || !manualInput.price) {
      setAlert('Please enter both name and price', 'error');
      return;
    }
    
    // Navigate to ingredient form with pre-filled data
    navigate('/ingredients/new', { 
      state: { 
        prefillData: {
          name: manualInput.name,
          purchasePrice: parseFloat(manualInput.price)
        } 
      } 
    });
  };
  
  const handleRetake = () => {
    setImageSrc(null);
    setExtractedData(null);
  };
  
  // Webcam configuration
  const videoConstraints = {
    width: 720,
    height: 480,
    facingMode: facingMode
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/ingredients')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5">
            Scan Price Tag
          </Typography>
        </Box>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Take a photo of a price tag to automatically extract product information.
          Make sure the price and product name are clearly visible.
        </Typography>
        
        {!imageSrc ? (
          // Camera view
          <Box sx={{ position: 'relative' }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              style={{ width: '100%', borderRadius: '8px' }}
            />
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FlipCameraIosIcon />}
                  onClick={handleFlipCamera}
                >
                  Flip Camera
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<PhotoCameraIcon />}
                  onClick={handleCapture}
                  disabled={capturing}
                >
                  {capturing ? 'Capturing...' : 'Capture'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        ) : (
          // Image review and data extraction view
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <img 
                  src={imageSrc} 
                  alt="Captured price tag" 
                  style={{ width: '100%', borderRadius: '8px' }} 
                />
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleRetake}
                  sx={{ mt: 2 }}
                >
                  Retake Photo
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    {processing ? (
                      <Box sx={{ width: '100%', textAlign: 'center', py: 3 }}>
                        <CircularProgress size={60} sx={{ mb: 2 }} />
                        <Typography variant="body1">
                          Processing image...
                        </Typography>
                        <LinearProgress sx={{ mt: 2 }} />
                      </Box>
                    ) : extractedData ? (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
                          <Typography variant="h6">Extracted Information</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        
                        <TextField
                          fullWidth
                          label="Product Name"
                          name="name"
                          value={manualInput.name}
                          onChange={handleInputChange}
                          sx={{ mb: 2 }}
                        />
                        
                        <TextField
                          fullWidth
                          label="Price"
                          name="price"
                          value={manualInput.price}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                          sx={{ mb: 3 }}
                        />
                        
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          onClick={handleContinue}
                        >
                          Continue to Ingredient Form
                        </Button>
                      </>
                    ) : (
                      <Typography>
                        Analyzing image... This may take a moment.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default IngredientCamera;
