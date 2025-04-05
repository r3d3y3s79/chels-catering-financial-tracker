import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';

const ChipInput = ({ value = [], onChange, label, helperText, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        const newValue = [...value, inputValue.trim()];
        onChange(newValue);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      const newValue = value.slice(0, -1);
      onChange(newValue);
    }
  };

  const handleDelete = (chipToDelete) => {
    const newValue = value.filter((chip) => chip !== chipToDelete);
    onChange(newValue);
  };

  return (
    <Box>
      <TextField
        fullWidth
        label={label}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder || 'Type and press Enter'}
        sx={{ mb: 1 }}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {value.map((chip) => (
          <Chip
            key={chip}
            label={chip}
            onDelete={() => handleDelete(chip)}
            color="primary"
            variant="outlined"
            size="small"
          />
        ))}
      </Box>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </Box>
  );
};

export default ChipInput;
