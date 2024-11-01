import { Autocomplete, TextField, Button, Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"; // Icon for "Not Found" message

export default function AccountField({ value, handleInputChange, ZOHO, selectedRowData }) {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null); // Selected account object
  const [inputValue, setInputValue] = useState("");
  const [notFoundMessage, setNotFoundMessage] = useState(""); // Message if nothing is found

  // Utility to find matched account by id
  const findMatchedAccount = (accountId) => accounts.find((account) => account.id === accountId);

  // Sync inputValue and selectedAccount with the provided value and selectedRowData
  useEffect(() => {
    let matchedAccount = null;

    if (value?.id) {
      matchedAccount = findMatchedAccount(value.id);
    } else if (selectedRowData?.What_Id?.id) {
      matchedAccount = findMatchedAccount(selectedRowData.What_Id.id);
    }

    setSelectedAccount(matchedAccount || null);
    setInputValue(matchedAccount?.Account_Name || ""); // Set input value or reset
  }, [value, selectedRowData, accounts]);

  // Fetch accounts from Zoho CRM
  useEffect(() => {
    const fetchAccounts = async () => {
      if (ZOHO) {
        try {
          const response = await ZOHO.CRM.API.getAllRecords({
            Entity: "Accounts",
            sort_order: "asc",
            per_page: 100,
            page: 1,
          });
          if (response?.data) {
            setAccounts(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch accounts:", error);
        }
      }
    };
    fetchAccounts();
  }, [ZOHO]);

  // Handle advanced search when no accounts are found
  const handleAdvancedSearch = async () => {
    setNotFoundMessage(""); // Reset message before search

    if (ZOHO && inputValue) {
      try {
        const searchCriteria = `(Account_Name:equals:${inputValue})`;
        const searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Accounts",
          Type: "criteria",
          Query: searchCriteria,
        });

        if (searchResults.data && searchResults.data.length > 0) {
          setAccounts(searchResults.data); // Update accounts with search results
          setNotFoundMessage(""); // Clear the not-found message
        } else {
          setNotFoundMessage(`"${inputValue}" not found in the database`);
        }
      } catch (error) {
        console.error("Error during search:", error);
        setNotFoundMessage("An error occurred while searching. Please try again.");
      }
    } else {
      setNotFoundMessage("Please enter a valid search term.");
    }
  };

  // Check if input value matches any account name
  const showSearchButton = inputValue && !accounts.some(account => account.Account_Name === inputValue);

  return (
    <Box>
      <Autocomplete
        freeSolo
        options={accounts}
        getOptionLabel={(option) => option.Account_Name || ""}
        value={selectedAccount}
        onChange={(event, newValue) => {
          setSelectedAccount(newValue); // Set selected account
          handleInputChange("associateWith", newValue); // Trigger change handler
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue); // Update input value
          setNotFoundMessage(""); // Clear not-found message
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            size="small"
            variant="outlined"
            label="Associate with"
          />
        )}
      />

      {/* Display search button when input value does not match any account */}
      {showSearchButton && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="text"
            startIcon={<SearchIcon />}
            onClick={handleAdvancedSearch}
            sx={{ color: "#1976d2", textTransform: "none" }}
          >
            Search Account Name
          </Button>
        </Box>
      )}

      {/* Display "Not found" message if applicable */}
      {notFoundMessage && (
        <Box display="flex" alignItems="center" color="error.main" sx={{ mt: 2 }}>
          <ErrorOutlineIcon sx={{ mr: 1 }} />
          <Typography variant="body2">{notFoundMessage}</Typography>
        </Box>
      )}
    </Box>
  );
}
