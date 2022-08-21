import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import moment from "moment";
import { DatePicker } from '@mui/x-date-pickers';
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import SnackBar from '@mui/material/Snackbar';
import Card from "@mui/material/Card";
import Step from "@mui/material/Step";
import Stepper from "@mui/material/Stepper";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import axios from "axios";

import './appointmentApp.css'

const API_BASE = "https://private-37dacc-cfcalendar.apiary-mock.com/";

const AppointmentApp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [confirmationSnackbarOpen, setConfirmationSnackbarOpen] = useState(false);
  const [confirmationSnackbarMessage, setConfirmationSnackbarMessage] = useState('');
  const [confirmationTextVisible, setConfirmationTextVisible] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(moment());
  const [appointmentSlot, setAppointmentSlot] = useState(null);
  const [appointmentMeridiem, setAppointmentMeridiem] = useState(0);
  const [validEmail, setValidEmail] = useState(true);
  const [validReason, setValidReason] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [smallScreen, setsSmallScreen] = useState(window.innerWidth < 768);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(()=>{
    axios.get(API_BASE + `mentors/1/agenda`).then(response => {
      console.log("response via db: ", response.data);
      handleDBReponse(response.data);
    });
  },[]);

  useEffect(()=>{
    stepIndex === 2 && setFinished(true);
  },[stepIndex])

  const handleSetAppointmentDate = (date) => {
    setAppointmentDate(date);
    setConfirmationTextVisible(true);

  }

  const handleSetAppointmentSlot = (slot) => {
    setAppointmentSlot(slot);
  }

  const handleSetAppointmentMeridiem = (meridiem) => {
    setAppointmentMeridiem(meridiem)
  }

  const handleSubmit = () => {
    setConfirmationModalOpen(false);
    const newAppointment = {
      name: firstName + " " + lastName,
      email: email,
      phone: reason,
      slot_date: moment(appointmentDate).format("YYYY-DD-MM"),
      slot_time: appointmentSlot
    };
    axios
      .post(API_BASE + "api/appointmentCreate", newAppointment)
      .then(response =>{
        setConfirmationSnackbarMessage("Appointment succesfully added!");
        setConfirmationSnackbarOpen(true);
        return;
      })
      .catch(err => {
        console.error(err);
        setConfirmationSnackbarMessage("Appointment failed to save.");
        setConfirmationSnackbarOpen(true);
        return;
      });
  }
  
  const handleNext = () => {
    setStepIndex((prevStepIndex) => prevStepIndex + 1);
    setFinished(stepIndex >= 2);
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex((prevStepIndex) => prevStepIndex - 1);
    }
  };

  const validateReason = (data) => {
    setReason(data);
    if(data.length > 10){
      setValidReason(true);
    }
    else{
      setValidReason(false);
    }
    return;
  }

  const checkDisableDate = (day) => {
    const dateString = moment(day).format("YYYY-DD-MM");
    return (
      schedule[dateString] === true ||
      moment(day)
        .startOf("day")
        .diff(moment().startOf("day")) < 0
    );
  }

  const handleDBReponse = (response) => {
    const appointments = response.calendar;
    const today = moment().startOf("day"); //start of today 12 am
    const initialSchedule = {};
    initialSchedule[today.format("YYYY-DD-MM")] = true;
    const localSchedule = !appointments.length
      ? initialSchedule
      : appointments.reduce((currentSchedule, appointment) => {
          const { date_time } = appointment;
          // const { slot_date, slot_time } = appointment;
          const slot_time = moment(date_time).format('HH:mm');
          const slot = moment(date_time).format('HH');
          const slot_date = moment(date_time).format('YYYY-DD-MM');
          const dateString = moment(slot_date, "YYYY-DD-MM").format("YYYY-DD-MM");
          // currentSchedule[dateString] = !currentSchedule[slot_date] ? Array(24).fill(false) : null;
          !currentSchedule[slot_date] && (currentSchedule[dateString] = Array(24).fill(false));
          currentSchedule[dateString][Number(slot)] = Array.isArray(currentSchedule[dateString]) ? true : null;
          return currentSchedule;
        }, initialSchedule);

    for (let day in localSchedule) {
      let slots = localSchedule[day];
      slots.length && slots.every(slot => slot === true) && (localSchedule[day] = true);
    }
    setLoading(false);
    setSchedule(localSchedule);
  }

  const renderAppointmentTimes = () => {
    if (!isLoading) {
      const slots = [...Array(24).keys()];
      return slots.map(slot => {
        const appointmentDateString = moment(appointmentDate).format(
          "YYYY-DD-MM"
        );
        const time1 = moment()
          .hour(slot)
          .minute(0)
          .add(0, "hours");
        const time2 = moment()
          .hour(slot)
          .minute(0)
          .add( 1, "hours");
        const scheduleDisabled = schedule[appointmentDateString]
          ? schedule[
              moment(appointmentDate).format("YYYY-DD-MM")
            ][slot]
          : false;
        const meridiemDisabled = appointmentMeridiem
          ? time1.format("a") === "am"
          : time1.format("a") === "pm";
        return (
          <FormControlLabel 
          label={time1.format("h:mm a") + " - " + time2.format("h:mm a")}
          key={slot}
          value={slot}
          style={{
            marginBottom: 15,
            // display: meridiemDisabled ? "none" : "inherit"
            display: "inherit"
          }}
          control={<Radio />}
          disabled={scheduleDisabled}
          />
        );
      });
    } else {
      return null;
    }
  }

  const renderAppointmentConfirmation = () =>{
    const spanStyle = { color: "#00C853" };
    return (
      <section>
        <p>
          Name:{" "}
          <span style={spanStyle}>
            {firstName} {lastName}
          </span>
        </p>
        <p>
          Number: <span style={spanStyle}>{reason}</span>
        </p>
        <p>
          Email: <span style={spanStyle}>{email}</span>
        </p>
        <p>
          Appointment:{" "}
          <span style={spanStyle}>
            {moment(appointmentDate).format(
              "dddd[,] MMMM Do[,] YYYY"
            )}
          </span>{" "}
          at{" "}
          <span style={spanStyle}>
            {moment()
              .hour(9)
              .minute(0)
              .add(appointmentSlot, "hours")
              .format("h:mm a")}
          </span>
        </p>
      </section>
    );
  }

  const renderStepActions = (step) => {
    return (
      <div style={{ margin: "12px 0" }}>
        <Button
          variant="contained"
          // disableRipple={true}
          disableFocusRipple={true}
          color='primary'
          onClick={handleNext}
          // backgroundColor="#00C853 !important"
          style={{ marginRight: 12, backgroundColor: "#00C853" }}
        >{stepIndex === 2 ? "Finish" : "Next"}</Button>
        {step > 0 && (
          <Button
            disabled={stepIndex === 0}
            disableTouchRipple={true}
            disableFocusRipple={true}
            onClick={handlePrev}
          >Back</Button>
        )}
      </div>
    );
  }
  
  const contactFormFilled =
    firstName &&
    lastName &&
    reason &&
    email &&
    validReason &&
    validEmail;

  const DatePickerExampleSimple = () => (
    <div>
        <DatePicker
          hintText="Select Date"
          mode={smallScreen ? "portrait" : "landscape"}
          value={appointmentDate}
          onChange={(value, date) => handleSetAppointmentDate(value)}
          shouldDisableDate={day => checkDisableDate(day)}
          renderInput={(props) => <TextField {...props} />}
        />
    </div>
  );
  const modalActions = [
    <Button
      label="Cancel"
      primary={false}
      onClick={() => setConfirmationModalOpen(false)}
    />,
    <Button
      label="Confirm"
      variant="contained"
      style={{ backgroundColor: "#00C853 !important" }}
      primary={true}
      onClick={() => handleSubmit()}
    />
  ];
    
  return (
    <div className='appointment-app-container'>
      <div className='appointment-app-bar'>
      <AppBar
        title="Appointment Scheduler"
        iconClassNameRight="muidocs-icon-navigation-expand-more">
          <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Session Scheduler
          </Typography>
        </Toolbar>
      </AppBar>
      </div>
      <div>
        <section
          style={{
            maxWidth: !smallScreen ? "80%" : "100%",
            margin: "auto",
            marginTop: !smallScreen ? 20 : 0
          }}
        >
          <Card
            style={{
              padding: "12px 12px 25px 12px",
              height: smallScreen ? "100vh" : null
            }}
          >
            <Stepper
              activeStep={stepIndex}
              orientation="vertical"
              linear={false}
            >
              <Step>
                <StepLabel>
                  Choose an available day for your appointment
                </StepLabel>
                <StepContent>
                  {DatePickerExampleSimple()}
                  {renderStepActions(0)}
                </StepContent>
              </Step>
              <Step disabled={!appointmentDate}>
                <StepLabel>
                  Choose an available time for your appointment
                </StepLabel>
                <StepContent>  
                  <FormControl>
                    <RadioGroup
                      style={{
                        marginTop: 15,
                        marginLeft: 15,
                        maxHeight: `450px`,
                        overflow: 'auto',
                        display: 'flex',
                        flexWrap: 'nowrap'
                      }}
                      name="appointmentTimes"
                      defaultSelected={appointmentSlot}
                      onChange={(evt, val) => handleSetAppointmentSlot(val)}
                    >
                      {renderAppointmentTimes()}
                    </RadioGroup>
                  </FormControl>
                  {renderStepActions(1)}
                </StepContent>
              </Step>
              <Step>
                <StepLabel>
                  Share your contact information with us and we'll send you a
                  reminder
                </StepLabel>
                <StepContent>
                  <p>
                    <section>
                      <TextField
                        style={{ display: "block" }}
                        name="first_name"
                        hintText="First Name"
                        label="First Name"
                        value={firstName}
                        onChange={(e) =>
                          setFirstName(e.target.value)
                        }
                      />
                      <TextField
                        style={{ display: "block" }}
                        name="last_name"
                        hintText="Last Name"
                        label="Last Name"
                        value={lastName}
                        onChange={(e) =>
                          setLastName(e.target.value)
                        }
                      />
                      <TextField
                        style={{ display: "block" }}
                        name="email"
                        hintText="youraddress@mail.com"
                        label="Email"
                        value={email}
                        errorText={
                          validEmail ? null : "Enter a valid email address"
                        }
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                      />
                      <TextField
                        style={{ display: "block" }}
                        name="reason"
                        hintText="+2348995989"
                        label="Reason"
                        value={reason}
                        errorText={
                          validReason ? null : "Please enter a reason for the session."
                        }
                        onChange={(e) =>
                          validateReason(e.target.value)
                        }
                      />
                      <Button
                        style={{ display: "block", backgroundColor: "#00C853", marginTop: 20, maxWidth: '600px' }}
                        variant="contained"
                        labelPosition="before"
                        primary={true}
                        fullWidth={true}
                        onClick={() =>
                          setConfirmationModalOpen(!confirmationModalOpen)
                        }
                      >"Schedule"</Button>
                    </section>
                  </p>
                  {renderStepActions(2)}
                </StepContent>
              </Step>
            </Stepper>
          </Card>
          <Dialog
            modal={true}
            open={confirmationModalOpen}
            onClose={()=>setConfirmationModalOpen(false)}
            actions={modalActions}
            title="Confirm your appointment"
          >
            {renderAppointmentConfirmation()}
          </Dialog>
          <SnackBar
            open={confirmationSnackbarOpen || isLoading}
            message={
              isLoading ? "Loading... " : confirmationSnackbarMessage || ""
            }
            autoHideDuration={10000}
            onRequestClose={() =>
              setConfirmationSnackbarOpen(false)
            }
          />
        </section>
      </div>
    </div>
  );
}
export default AppointmentApp;
