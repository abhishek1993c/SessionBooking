import React from "react";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import AppointmentApp from "./components/AppointmentApp.js";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { blue } from "@mui/material/colors";
import "./App.css";

const App = () =>{
  const theme = createTheme({
    palette: {
      primary: {
        main: blue[500]
      }
    }
  });

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <ThemeProvider theme={theme}>
          <AppointmentApp />
        </ThemeProvider>
      </LocalizationProvider>
    </div>
  );
}

export default App;
