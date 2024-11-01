import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid2 as Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useState } from "react";
import { Datepicker } from "@mobiscroll/react";
import CustomTextField from "./atom/CustomTextField";

const ThirdComponent = ({ formData, handleInputChange }) => {
  const [openDatepicker, setOpenDatepicker] = useState(false);

  const customInputComponent = () => {
    return (
      <CustomTextField
        fullWidth
        size="small"
        label=""
        variant="outlined"
        value={formData.startTime}
        onClick = {()=>setOpenDatepicker(true)}
        // onChange={(e) => handleInputChange("start", e.target.value)}
      />
    );
  };
  return (
    <Box>
      <FormControl>
        <FormLabel id="demo-radio-buttons-group-label">Repeat</FormLabel>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          defaultValue="once"
          name="radio-buttons-group"
          value={formData.repeat}
          onChange={(e) => handleInputChange("repeat", e.target.value)}
        >
          <FormControlLabel
            value="once"
            control={<Radio size="small" />}
            label="Once (This activity occurs only once)"
          />
          <FormControlLabel
            value="daily"
            control={<Radio size="small" />}
            label="Daily (This activity occurs daily)"
          />
          <FormControlLabel
            value="weekly"
            control={<Radio size="small" />}
            label="Weekly (This activity occurs weekly)"
          />
          <FormControlLabel
            value="monthly"
            control={<Radio size="small" />}
            label="Monthly (This activity occurs monthly)"
          />
          <FormControlLabel
            value="yearly"
            control={<Radio size="small" />}
            label="Yearly (This activity occurs yearly)"
          />
        </RadioGroup>
      </FormControl>

      <Grid container spacing={2} sx={{ mt: 1, py: 1 }}>
        <Grid size={6}>
          <Box display="flex" alignItems="center">
            <Typography variant="body1" sx={{ minWidth: "80px" }}>
              Starts :
            </Typography>
            {/* <CustomTextField
              fullWidth
              size="small"
              label=""
              variant="outlined"
              value={formData.starts}
              onChange={(e) => handleInputChange("start", e.target.value)}
            /> */}
            <Datepicker
              controls={["calendar"]}
              select="range"
              display="center"
              touchUi={true}
              
              inputComponent={customInputComponent}
              onClose={() => setOpenDatepicker(false)}
              // className="mbsc-textfield"
              // inputProps={props}
              // maxHeight={"400px"}
              // maxWidth={"1000px"}
              isOpen={openDatepicker}
              // showOnFocus={false}
              // showOnClick={false}
            />
          </Box>
        </Grid>
        <Grid size={6}>
          <Box display="flex" alignItems="center">
            <Typography variant="body1" sx={{ minWidth: "80px" }}>
              Ends :
            </Typography>
            <CustomTextField
              fullWidth
              size="small"
              label=""
              variant="outlined"
              value={formData.ends}
              onChange={(e) => handleInputChange("end", e.target.value)}
            />
          </Box>
          <FormControlLabel
            value="no end date"
            control={<Radio size="small" />}
            label="No end date"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThirdComponent;
