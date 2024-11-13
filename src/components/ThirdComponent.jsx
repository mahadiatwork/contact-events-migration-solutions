import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid2 as Grid,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import { Datepicker } from "@mobiscroll/react";
import CustomTextField from "./atom/CustomTextField";

const ThirdComponent = ({ formData, handleInputChange }) => {
  const [openStartDatepicker, setOpenStartDatepicker] = useState(false);
  const [openEndDatepicker, setOpenEndDatepicker] = useState(false);

  const CustomInputComponent = ({ field }) => {
    return (
      <CustomTextField
        fullWidth
        size="small"
        label=""
        variant="outlined"
        value={formData[field]}
        onClick={() =>
          field === "startTime"
            ? setOpenStartDatepicker(true)
            : setOpenEndDatepicker(true)
        }
      />
    );
  };

  return (
    <Box>
      <FormControl>
        <FormLabel id="demo-radio-buttons-group-label">Gender</FormLabel>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          name="radio-buttons-group"
          value={formData.occurrence}
          onChange={(e) => handleInputChange("occurrence", e.target.value)}
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
            <Datepicker
              controls={["calendar",'time']}
              calendarType="month"
              display="center"
              calendarScroll={"vertical"}
              inputComponent={() => (
                <CustomInputComponent field="startTime" />
              )}
              onClose={() => setOpenStartDatepicker(false)}
              onChange={(e) => handleInputChange("startTime", e.value)}
              isOpen={openStartDatepicker}
            />
          </Box>
        </Grid>
        <Grid size={6}>
          <Box display="flex" alignItems="center">
            <Typography variant="body1" sx={{ minWidth: "80px" }}>
              Ends :
            </Typography>
            <Datepicker
              controls={["calendar",'time']}
              calendarType="month"
              display="center"
              disabled
              calendarScroll={"vertical"}
              inputComponent={() => (
                <CustomInputComponent field="endTime" />
              )}
              onClose={() => setOpenEndDatepicker(false)}
              onChange={(e) => handleInputChange("endTime", e.value)}
              isOpen={openEndDatepicker}
            />
          </Box>
          <FormControlLabel
            control={
              <Radio
                size="small"
                checked={formData.noEndDate}
                onChange={(e) =>
                  handleInputChange("noEndDate", e.target.checked)
                }
              />
            }
            label="No end date"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThirdComponent;