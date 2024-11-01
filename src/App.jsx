import React, { useEffect, useState, createContext, useContext } from "react";
import "./App.css";
import ActivityTable from "./components/ActivityTable";
import { CircularProgress, Box } from "@mui/material"; // Add MUI CircularProgress for the loader
import { subDays } from "date-fns";

const ZOHO = window.ZOHO;

// Create a ZohoContext to hold the ZOHO data
export const ZohoContext = createContext();

function App() {
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [filterDate, setFilterDate] = useState("All");
  const [cache, setCache] = useState({}); // Cache to store fetched results
  const [recentColors, setRecentColor] = useState(""); // Move this to context
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    // Initialize Zoho Embedded App once
    ZOHO.embeddedApp.init().then(() => {
      setZohoLoaded(true);
      // Fetch the logged-in user
      ZOHO.CRM.CONFIG.getCurrentUser().then(function (data) {
        setLoggedInUser(data?.users[0]);
      });
    });
  }, []);

  useEffect(() => {
    async function getData() {
      // Check if the data for the current filterDate is already in the cache
      if (cache[filterDate]) {
        setEvents(cache[filterDate]);
        setLoading(false); // Set loading to false since we're using cached data
        return;
      }

      if (zohoLoaded) {
        setLoading(true); // Set loading to true when data fetching starts
        try {
          // Dynamic dates based on filterDate
          let beginDate1, closeDate1;
          const currentDate = new Date();

          if (filterDate === "Current Week") {
            const firstDayOfWeek = currentDate.getDate() - currentDate.getDay(); // Get the first day of the week (Sunday)
            beginDate1 = new Date(currentDate.setDate(firstDayOfWeek));
            closeDate1 = new Date(currentDate.setDate(firstDayOfWeek + 6));
          } else if (filterDate === "Current Month") {
            beginDate1 = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              1
            );
            closeDate1 = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              0
            );
          } else if (filterDate === "Last 7 Days") {
            beginDate1 = subDays(currentDate, 7);
            closeDate1 = new Date(); // Set closeDate1 to today
          } else if (filterDate === "Last 30 Days") {
            beginDate1 = subDays(currentDate, 30);
            closeDate1 = new Date(); // Set closeDate1 to today
          } else if (filterDate === "Last 90 Days") {
            beginDate1 = subDays(currentDate, 90); // Adjusting for the "Last 90 Days"
            closeDate1 = new Date(); // Set closeDate1 to today
          } else if (filterDate === "Next Week") {
            const firstDayNextWeek =
              currentDate.getDate() - currentDate.getDay() + 7; // Next week's first day
            beginDate1 = new Date(currentDate.setDate(firstDayNextWeek));
            closeDate1 = new Date(currentDate.setDate(firstDayNextWeek + 6)); // Next week's last day
          } else if (filterDate === "All") {
            // No specific date filter
            beginDate1 = new Date("2024-01-01"); // Very early date to fetch all events
            closeDate1 = new Date(); // Up to current date
          }

          // Format the dates to YYYY-MM-DDTHH:MM:SS+Timezone
          const formattedBeginDate = `${beginDate1.getFullYear()}-${String(
            beginDate1.getMonth() + 1
          ).padStart(2, "0")}-${String(beginDate1.getDate()).padStart(
            2,
            "0"
          )}T00:00:00+11:00`;
          const formattedCloseDate = `${closeDate1.getFullYear()}-${String(
            closeDate1.getMonth() + 1
          ).padStart(2, "0")}-${String(closeDate1.getDate()).padStart(
            2,
            "0"
          )}T23:59:59+11:00`;

          // Custom event search with dynamic dates
          const req_data_meetings1 = {
            url: `https://www.zohoapis.com.au/crm/v3/Events/search?criteria=((Start_DateTime:greater_equal:${encodeURIComponent(
              formattedBeginDate
            )})and(End_DateTime:less_equal:${encodeURIComponent(
              formattedCloseDate
            )}))`,
            method: "GET",
            param_type: 1,
          };

          // Fetching data with custom search criteria
          const data1 = await ZOHO.CRM.CONNECTION.invoke(
            "zoho_crm_conn",
            req_data_meetings1
          );
          const eventsData = data1?.details?.statusMessage?.data || [];

          // Fetch all meetings
          const allMeetings = await ZOHO.CRM.API.getAllRecords({
            Entity: "Events",
            sort_order: "asc",
            per_page: 100,
            page: 1,
          });

          const allMeetingsData = allMeetings?.data || [];

          // Combine both arrays (eventsData and allMeetingsData)
          const combinedEvents = [...eventsData, ...allMeetingsData];

          // Deduplicate based on id using a Map
          const uniqueEventsMap = new Map(
            combinedEvents.map((event) => [event.id, event])
          );

          // Convert the Map back to an array
          const uniqueEvents = Array.from(uniqueEventsMap.values());

          // Sort by Created_Time (latest first)
          const sortedUniqueEvents = uniqueEvents.sort((a, b) => {
            const dateA = new Date(a.Created_Time);
            const dateB = new Date(b.Created_Time);
            return dateB - dateA; // Sort in descending order (latest first)
          });

          // Store the sorted, deduplicated data in the cache
          setCache((prevCache) => ({
            ...prevCache,
            [filterDate]: sortedUniqueEvents, // Cache the data for the current filterDate
          }));

          // Set the events state
          setEvents(sortedUniqueEvents);

          // Get organization variable
          await ZOHO.CRM.API.getOrgVariable("recent_colors").then(function (
            data
          ) {
            // Parse the string to an array and store it in the state
            const colorsArray = JSON.parse(data?.Success?.Content || "[]");
            setRecentColor(colorsArray);
          });

          // Get users data
          const usersResponse = await ZOHO.CRM.API.getAllRecords({
            Entity: "users",
            sort_order: "asc",
            per_page: 100,
            page: 1,
          });
          setUsers(usersResponse.users); // Set the users in the state

          setLoading(false); // Ensure loading is turned off when the data fetching is complete
        } catch (error) {
          console.error("Error fetching data", error);
          setLoading(false); // Ensure loading is turned off even if there's an error
        }
      }
    }

    getData();
  }, [zohoLoaded, filterDate, cache]);

  console.log({ events });

  return (
    <ZohoContext.Provider
      value={{
        users,
        events,
        ZOHO,
        filterDate,
        setFilterDate,
        recentColors,
        setRecentColor,
      }}
    >
      {/* Conditionally render the loader or the main content */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress /> {/* MUI loader */}
        </Box>
      ) : (
        <ActivityTable
          events={events}
          ZOHO={ZOHO}
          users={users}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          recentColors={recentColors}
          setRecentColor={setRecentColor}
          loggedInUser={loggedInUser}
          setEvents={setEvents}
        />
      )}
    </ZohoContext.Provider>
  );
}

export default App;
