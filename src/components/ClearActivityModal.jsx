import * as React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputLabel,
  Typography,
} from "@mui/material";
import "react-quill/dist/quill.snow.css";

export default function ClearActivityModal({
  open,
  handleClose,
  selectedRowData,
  ZOHO,
}) {
  const calculateDuration = (durationInMinutes) => {
    if (!durationInMinutes) return "5 minutes";
    const minutes = parseInt(durationInMinutes, 10);
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }
  };

  const [duration, setDuration] = React.useState(
    calculateDuration(selectedRowData?.duration)
  );
  const [result, setResult] = React.useState("To-do Done");
  const [addActivityToHistory, setAddActivityToHistory] = React.useState(false);
  const [clearChecked, setClearChecked] = React.useState(false);
  const [eraseChecked, setEraseChecked] = React.useState(false);
  const [activityDetails, setActivityDetails] = React.useState(
    selectedRowData?.Description || ""
  );

  const handleClearChange = (event) => {
    setClearChecked(event.target.checked);
    if (event.target.checked) {
      setEraseChecked(false); // Uncheck "Erase" if "Clear" is checked
    }
  };

  const handleEraseChange = (event) => {
    setEraseChecked(event.target.checked);
    if (event.target.checked) {
      setClearChecked(false); // Uncheck "Clear" if "Erase" is checked
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (clearChecked && !eraseChecked) {
      const recordData = {
        Name:
          selectedRowData.Participants.length > 0
            ? selectedRowData.Participants.map(
                (participant) => participant.name
              ).join(", ")
            : selectedRowData?.Event_Title,
        Duration: selectedRowData?.Duration_Min,
        History_Type: selectedRowData?.Type_of_Activity,
        Stakeholder: { id: selectedRowData?.What_Id?.id },
        Regarding: selectedRowData?.Regarding,
        Date: selectedRowData?.Start_DateTime,
        Owner: selectedRowData?.Owner,
      };

      // Conditionally add History_Details_Plain only if addActivityToHistory is checked
      if (addActivityToHistory) {
        recordData.History_Details_Plain = activityDetails;
      }

      await ZOHO.CRM.API.insertRecord({
        Entity: "History1",
        APIData: recordData,
        Trigger: ["workflow"],
      }).then(async function (data) {
        if (data.data[0].code === "SUCCESS") {
          const historyRecordId = data.data[0].details.id;

          if (selectedRowData.Participants.length > 0) {
            const participantInsertPromises =
              selectedRowData.Participants.filter(
                (participant) => participant.type === "contact"
              ).map(async (participant) => {
                const participantData = {
                  Contact_Details: { id: participant.participant },
                  Contact_History_Info: { id: historyRecordId },
                };

                return await ZOHO.CRM.API.insertRecord({
                  Entity: "History_X_Contacts",
                  APIData: participantData,
                  Trigger: ["workflow"],
                });
              });

            await Promise.all(participantInsertPromises);
          }

          await ZOHO.CRM.API.deleteRecord({
            Entity: "Events",
            RecordID: selectedRowData?.id,
          }).then(function (data) {
            if (data.data[0].code === "SUCCESS") {
              window.location.reload();
            } else {
              alert(
                "There was an issue while clearing the event, try again!!!"
              );
              window.location.reload();
            }
          });
        }
      });
    }

    if (!clearChecked && eraseChecked) {
      await ZOHO.CRM.API.deleteRecord({
        Entity: "Events",
        RecordID: selectedRowData?.id,
      }).then(function (data) {
        if (data.data[0].code === "SUCCESS") {
          window.location.reload();
        } else {
          alert("There was an issue while erasing the event, try again!!!");
          window.location.reload();
        }
      });
    }
  };
  const handleActivityDetailsChange = (e) => {
    setActivityDetails(e.target.value);
  };

  const isUpdateDisabled = !clearChecked && !eraseChecked; // Disable button if neither checkbox is checked

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      maxWidth="md" // Set a maximum width
      fullWidth // Ensures the dialog takes up the full width of the container
      scroll="paper" // Adds scrolling if content exceeds the dialog height
    >
      {selectedRowData === null ? (
        <DialogContent>{/* <CircularProgress /> */}</DialogContent>
      ) : (
        <>
          <DialogTitle id="modal-title">Clear Activity</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent dividers>
              <Typography variant="subtitle1">
                <strong>Type:</strong> {selectedRowData?.Type_of_Activity}
              </Typography>
              <TextField
                fullWidth
                label="Title"
                value={selectedRowData?.Event_Title || ""}
                margin="dense"
                multiline
                disabled
                size="small"
              />
              <TextField
                fullWidth
                label="Organiser"
                value={selectedRowData?.Owner?.name || ""}
                margin="dense"
                size="small"
                disabled
              />
              <TextField
                fullWidth
                label="Participants"
                value={
                  selectedRowData?.Participants &&
                  selectedRowData.Participants.length > 0
                    ? selectedRowData.Participants.map(
                        (participant) => participant.name
                      ).join(", ")
                    : "No Participant"
                }
                margin="dense"
                size="small"
                disabled
              />
              <TextField
                fullWidth
                label="Associate With"
                value={selectedRowData?.What_Id?.name || ""}
                margin="dense"
                size="small"
                disabled
              />

              <FormGroup column style={{ marginTop: "10px" }}>
                <InputLabel id="duration-label">Duration</InputLabel>
                <Select
                  labelId="duration-label"
                  value={duration}
                  size="small"
                  onChange={(e) => setDuration(e.target.value)}
                  sx={{ minWidth: 150 }}
                  disabled
                >
                  <MenuItem value="5 minutes">5 minutes</MenuItem>
                  <MenuItem value="30 minutes">30 minutes</MenuItem>
                  <MenuItem value="1 hour">1 hour</MenuItem>
                  <MenuItem value="2 hours">2 hours</MenuItem>
                </Select>
              </FormGroup>
              <br />
              <Typography variant="subtitle1" style={{ marginTop: "10px" }}>
                Results:
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={clearChecked}
                      onChange={handleClearChange}
                    />
                  }
                  label="Clear"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={eraseChecked}
                      onChange={handleEraseChange}
                    />
                  }
                  label="Erase"
                />
                <Select
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  sx={{ marginLeft: 2, minWidth: 150 }}
                  size="small"
                >
                  <MenuItem value="To-do Done">To-do Done</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormGroup>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={addActivityToHistory}
                    onChange={() =>
                      setAddActivityToHistory(!addActivityToHistory)
                    }
                  />
                }
                label="Add Activity Details to History"
                style={{ marginTop: "10px" }}
              />

              <TextField
                fullWidth
                label="Activity Details"
                value={activityDetails}
                onChange={handleActivityDetailsChange}
                margin="dense"
                multiline
                minRows={4}
                size="small"
                disabled={!addActivityToHistory}
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={isUpdateDisabled}
              >
                Update
              </Button>
            </DialogActions>
          </form>
        </>
      )}
    </Dialog>
  );
}
