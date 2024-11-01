import React from 'react';
import { TextField } from '@mui/material';

const CustomTextField = ({ onChange, value, ...props }) => {
  return (
    <TextField
      variant="outlined"
      size="small"
      fullWidth
      autoComplete='off'
      value={value}
      onChange={onChange}
      {...props} 
      sx={{
        height: "40px", // You can adjust this value to your preferred height
        "& .MuiOutlinedInput-root": {
          height: "100%", // Ensure the full height is applied to the input
        },
        "& .MuiSelect-select, & .MuiAutocomplete-input": {
          padding: "8px 12px", // Adjust padding to match the height
        },
      }}
    />
  );
};

export default CustomTextField;
