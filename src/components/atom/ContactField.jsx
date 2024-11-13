import { Autocomplete, TextField, Box, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function ContactField({
  formData,
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
  const [loading, setLoading] = useState(false); // Loading state for search

  // Sync selectedParticipants with formData.scheduledWith or selectedRowData on mount
  useEffect(() => {
    console.log({formData})
    if (formData.scheduledWith && formData.scheduledWith.length > 0) {
      const initialParticipants = formData.scheduledWith.map((contact) => ({
        Full_Name: contact.Full_Name || contact.name,
        id: contact.participant,
      }));
      setSelectedParticipants(initialParticipants);
    } else if (selectedRowData?.Participants?.length > 0) {
      const defaultParticipants = selectedRowData.Participants.map(
        (participant) => ({
          Full_Name: participant.name,
          id: participant.participant,
        })
      );
      setSelectedParticipants(defaultParticipants);
    }
  }, [formData.scheduledWith, selectedRowData]);

  const handleSearch = async (query) => {
    setNotFoundMessage(""); // Reset the message
    setLoading(true); // Start loading

    if (ZOHO && query.trim()) {
      try {
        const searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Contacts",
          Type: "word", // Full-text search
          Query: query.trim(),
        });

        if (searchResults.data && searchResults.data.length > 0) {
          const formattedContacts = searchResults.data.map((contact) => ({
            Full_Name: contact.Full_Name,
            id: contact.id,
          }));

          const mergedContacts = [
            ...formattedContacts,
            ...selectedParticipants,
          ];
          const uniqueContacts = mergedContacts.filter(
            (contact, index, self) =>
              index === self.findIndex((c) => c.id === contact.id)
          );

          setContacts(uniqueContacts);
          setNotFoundMessage("");
        } else {
          setNotFoundMessage(`"${query}" not found in the database`);
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

  const handleInputChangeWithDelay = (event, newInputValue) => {
    setInputValue(newInputValue);
    setNotFoundMessage(""); // Clear the "Not found" message when user types again

    if (newInputValue.endsWith(" ")) {
      // Trigger search only when a space is detected
      handleSearch(newInputValue);
    }
  };

  const handleSelectionChange = (event, newValue) => {
    setSelectedParticipants(newValue);
    handleInputChange(
      "scheduledWith",
      newValue.map((contact) => ({
        Full_Name: contact.Full_Name,
        participant: contact.id,
        type: "contact",
      }))
    );
  };


  console.log({selectedParticipants})

  return (
    <Box>
      <Autocomplete
        multiple
        options={contacts}
        getOptionLabel={(option) => option.Full_Name || ""}
        value={selectedParticipants}
        onChange={handleSelectionChange}
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
            label="Scheduled with"
            placeholder="Type and press space to search..."
          />
        )}
      />
    </Box>
  );
}
