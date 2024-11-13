import { Autocomplete, TextField, Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"; // Icon for "Not Found" message

export default function AccountField({
  formData,
  handleInputChange,
  ZOHO,
  selectedRowData,
}) {
  const [accounts, setAccounts] = useState([]); // No initial accounts
  const [selectedAccount, setSelectedAccount] = useState(null); // Selected account object
  const [inputValue, setInputValue] = useState("");
  const [notFoundMessage, setNotFoundMessage] = useState(""); // Message if nothing is found
  const [loading, setLoading] = useState(false); // Loading state for search

  // Sync selectedAccount with formData.What_Id for the default value
  useEffect(() => {
    if (formData.What_Id?.id) {
      const selected = {
        Account_Name: formData.What_Id.name,
        id: formData.What_Id.id,
      };
      setSelectedAccount(selected);
      setInputValue(formData.What_Id.name || "");
      setAccounts((prevAccounts) =>
        [selected, ...prevAccounts].filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i // Ensure no duplicates
        )
      );
    }
  }, [formData.What_Id]); // Rerun effect only when formData.What_Id changes
  // Handle advanced search when a space is detected in the input
  const handleAdvancedSearch = async (query) => {
    setNotFoundMessage(""); // Reset message before search
    setLoading(true); // Start loading

    if (ZOHO && query.trim()) {
      try {
        const searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Accounts",
          Type: "word", // Full-text search
          Query: query.trim(),
        });

        if (searchResults.data && searchResults.data.length > 0) {
          const formattedAccounts = searchResults.data.map((account) => ({
            Account_Name: account.Account_Name,
            id: account.id,
          }));
          setAccounts(formattedAccounts);
          setNotFoundMessage(""); // Clear the not-found message
        } else {
          setNotFoundMessage(`"${query.trim()}" not found in the database`);
        }
      } catch (error) {
        console.error("Error during search:", error);
        setNotFoundMessage(
          "An error occurred while searching. Please try again."
        );
      } finally {
        setLoading(false); // End loading
      }
    } else {
      setLoading(false);
    }
  };

  // Custom input change handler to detect spaces and trigger search
  const handleInputChangeWithDelay = (event, newInputValue) => {
    setInputValue(newInputValue); // Update input value
    setNotFoundMessage(""); // Clear not-found message

    if (newInputValue.endsWith(" ")) {
      // Trigger search only when a space is detected
      handleAdvancedSearch(newInputValue);
    }
  };

  return (
    <Box>
      <Autocomplete
        freeSolo
        options={accounts}
        getOptionLabel={(option) => option.Account_Name || ""}
        value={selectedAccount}
        onChange={(event, newValue) => {
          setSelectedAccount(newValue); // Set selected account
          // console.log({What_Id: {id: newValue.id, name: newValue.Account_Name} })
          handleInputChange("What_Id", {
            id: newValue.id,
            name: newValue.Account_Name,
          }); // Trigger change handler
        }}
        inputValue={inputValue}
        onInputChange={handleInputChangeWithDelay} // Use the custom handler
        loading={loading} // Show loading indicator during search
        noOptionsText={
          notFoundMessage ? (
            <Box display="flex" alignItems="center" color="error.main">
              <ErrorOutlineIcon sx={{ mr: 1 }} />
              <Typography variant="body2">{notFoundMessage}</Typography>
            </Box>
          ) : (
            "No options"
          )
        }
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            size="small"
            variant="outlined"
            label="Associate with"
            placeholder="Type and press space to search..."
          />
        )}
      />
    </Box>
  );
}
