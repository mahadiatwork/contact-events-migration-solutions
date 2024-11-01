import {
  Autocomplete,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function ContactField({
  value,
  handleInputChange,
  ZOHO,
  selectedRowData,
}) {
  const [contacts, setContacts] = useState([]); // Contacts fetched from Zoho
  const [selectedParticipants, setSelectedParticipants] = useState(
    selectedRowData?.Participants || []
  ); // Selected values in autocomplete
  const [inputValue, setInputValue] = useState(""); // Store the input text
  const [notFoundMessage, setNotFoundMessage] = useState("");

  // Sync selectedParticipants with value and selectedRowData
  React.useEffect(() => {
    if (selectedRowData?.Participants?.length > 0) {
      // Otherwise, if selectedRowData is available, use it as the default
      const defaultParticipants = selectedRowData.Participants.map(
        (participant) => ({
          Full_Name: participant.name, // Match with Full_Name for Autocomplete
          id: participant.participant,
        })
      );
      setSelectedParticipants(defaultParticipants);
    }
  }, [selectedRowData, contacts]);

  const handleSearch = async (searchType) => {
    setNotFoundMessage(""); // Reset the message

    if (ZOHO && inputValue) {
      try {
        let searchResults;

        // Set the search method based on the search type
        if (searchType === "firstName") {
          // Search by first name using criteria
          const searchCriteria = `(First_Name:equals:${inputValue})`;
          searchResults = await ZOHO.CRM.API.searchRecord({
            Entity: "Contacts",
            Type: "criteria",
            Query: searchCriteria,
          });
        } else if (searchType === "fullName") {
          // Search by full name using "word" type, which performs a full-text search
          searchResults = await ZOHO.CRM.API.searchRecord({
            Entity: "Contacts",
            Type: "word", // Full-text search
            Query: inputValue,
          });
        }

        if (searchResults.data && searchResults.data.length > 0) {
          const formattedContacts = searchResults.data.map((contact) => ({
            Full_Name: contact.Full_Name,
            id: contact.id,
          }));

          // Merge new search results with the previously selected participants
          const mergedContacts = [
            ...formattedContacts,
            ...selectedParticipants,
          ];

          // Remove duplicates (in case the search result includes already selected contacts)
          const uniqueContacts = mergedContacts.filter(
            (contact, index, self) =>
              index === self.findIndex((c) => c.id === contact.id)
          );

          setContacts(uniqueContacts); // Update contacts list with merged data
          setNotFoundMessage(""); // Clear the "Not Found" message
        } else {
          setNotFoundMessage(`"${inputValue}" not found in the database`); // Show "Not Found" message
        }
      } catch (error) {
        console.error("Error during advanced search:", error);
        setNotFoundMessage(
          "An error occurred while searching. Please try again."
        );
      }
    } else {
      setNotFoundMessage("Please enter a valid search term.");
    }
  };

  const handleSelectionChange = (event, newValue) => {
    setSelectedParticipants(newValue); // Update the selected values
    // Update the parent component with the selected contacts
    handleInputChange(
      "scheduledWith",
      newValue.map((contact) => ({
        Full_Name: contact.Full_Name,
        participant: contact.id,
        type: "contact",
      }))
    );
  };


  return (
    <Box>
      <Autocomplete
        multiple
        options={contacts}
        getOptionLabel={(option) => option.Full_Name || ""}
        value={selectedParticipants} // Control the selected values
        onChange={handleSelectionChange} // Handle the selection of new values
        inputValue={inputValue} // Display input text
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue); // Update input value when typing
          setNotFoundMessage(""); // Clear the "Not found" message when user types again
        }}
        noOptionsText={
          <Box display="flex" alignItems="center">
            <Button
              variant="text"
              startIcon={<SearchIcon />}
              onClick={() => handleSearch("fullName")}
              sx={{ color: "#1976d2", textTransform: "none" }}
            >
              Search by Full Name
            </Button>

            {notFoundMessage && (
              <Box display="flex" alignItems="center" color="error.main" ml={2}>
                <ErrorOutlineIcon sx={{ mr: 1 }} />
                <Typography variant="body2">{notFoundMessage}</Typography>
              </Box>
            )}
          </Box>
        }
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            size="small"
            variant="outlined"
            label="Scheduled with"
          />
        )}
      />
    </Box>
  );
}
