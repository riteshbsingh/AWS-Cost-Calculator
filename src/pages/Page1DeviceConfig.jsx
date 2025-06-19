// src/components/pages/Page1DeviceConfig.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const machineOptions = [25, 50, 100, 500, 1000, 5000, 10000];

function Page1DeviceConfig() {
  const navigate = useNavigate();
  const { config, setConfig } = useAppContext();

  const [machines, setMachines] = useState(config.machines);
  const [tagsPerMachine, setTagsPerMachine] = useState(config.tagsPerMachine);
  const [messageSizeKB, setMessageSizeKB] = useState(config.messageSizeKB);
  const [frequencySec, setFrequencySec] = useState(config.frequencySec);
  const [gateways, setGateways] = useState(config.gateways);

  // Derived values
  const totalTags = machines * tagsPerMachine;
  const messagesPerDayPerDevice = Math.floor(86400 / frequencySec);
  const messagesPerDayAllDevices = messagesPerDayPerDevice * machines;
  const messagesPerMonthAllDevices = messagesPerDayAllDevices * 30;
  const messagesPerYearAllDevices = messagesPerDayAllDevices * 365;

  const dataPerDayGB = (messageSizeKB * messagesPerDayAllDevices) / 1_000_000;
  const dataPerMonthGB = dataPerDayGB * 30;
  const dataPerYearGB = dataPerDayGB * 365;

  const handleNext = () => {
    setConfig((prev) => ({
      ...prev,
      machines,
      tagsPerMachine,
      messageSizeKB,
      frequencySec,
      gateways,
    }));
    navigate("/cloud-broker");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Step 1: Device & Data Configuration
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Machines</InputLabel>
              <Select
                value={machines}
                label="Machines"
                onChange={(e) => setMachines(Number(e.target.value))}
              >
                {machineOptions.map((count) => (
                  <MenuItem key={count} value={count}>
                    {count.toLocaleString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Tags per Machine"
              type="number"
              value={tagsPerMachine}
              onChange={(e) => setTagsPerMachine(Number(e.target.value))}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Message Size (KB)"
              type="number"
              value={messageSizeKB}
              onChange={(e) => setMessageSizeKB(Number(e.target.value))}
              fullWidth
              inputProps={{ min: 0.1, step: 0.1 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Frequency (sec)"
              type="number"
              value={frequencySec}
              onChange={(e) => setFrequencySec(Number(e.target.value))}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Gateway Devices"
              type="number"
              value={gateways}
              onChange={(e) => setGateways(Number(e.target.value))}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 4 }}>
          Summary
        </Typography>
        <ul>
          <li>Total Tags: <strong>{totalTags.toLocaleString()}</strong></li>
          <li>Messages/Day (All Devices): <strong>{messagesPerDayAllDevices.toLocaleString()}</strong></li>
          <li>Data/Day: <strong>{dataPerDayGB.toFixed(2)} GB</strong></li>
          <li>Data/Month: <strong>{dataPerMonthGB.toFixed(2)} GB</strong></li>
          <li>Data/Year: <strong>{dataPerYearGB.toFixed(2)} GB</strong></li>
        </ul>

        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          sx={{ mt: 3 }}
        >
          Next: Select Cloud Broker
        </Button>
      </Paper>
    </Container>
  );
}

export default Page1DeviceConfig;
