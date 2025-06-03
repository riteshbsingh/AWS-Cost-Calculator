import React, { useState } from "react";
import {
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CssBaseline,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const machineOptions = [25, 50, 100, 500, 1000, 5000, 10000];

const vmConfigurations = [
  {
    devices: 25,
    singleTenant: {
      vmSize: "Standard_B2ms",
      cpu: "2 vCPU",
      ram: "8 GB",
      storage: "128 GB SSD",
      cost: "$70",
      rationale: "Basic performance, good isolation for small scale",
    },
    multiTenant: {
      vmSize: "Standard_B1ms",
      cpu: "1 vCPU",
      ram: "2 GB",
      storage: "64 GB SSD",
      cost: "$35",
      rationale: "Shared resources, cost-effective for light loads",
    },
  },
  {
    devices: 50,
    singleTenant: {
      vmSize: "Standard_B4ms",
      cpu: "4 vCPU",
      ram: "16 GB",
      storage: "256 GB SSD",
      cost: "$140",
      rationale: "Handles moderate load with isolation",
    },
    multiTenant: {
      vmSize: "Standard_B2ms",
      cpu: "2 vCPU",
      ram: "8 GB",
      storage: "128 GB SSD",
      cost: "$70",
      rationale: "Efficient resource sharing, scales well",
    },
  },
  {
    devices: 100,
    singleTenant: {
      vmSize: "Standard_D4s_v3",
      cpu: "4 vCPU",
      ram: "16 GB",
      storage: "512 GB SSD",
      cost: "$190",
      rationale: "Good for higher throughput and isolation",
    },
    multiTenant: {
      vmSize: "Standard_B4ms",
      cpu: "4 vCPU",
      ram: "16 GB",
      storage: "256 GB SSD",
      cost: "$140",
      rationale: "Shared, balanced cost-performance",
    },
  },
  {
    devices: 500,
    singleTenant: {
      vmSize: "Standard_D8s_v3",
      cpu: "8 vCPU",
      ram: "32 GB",
      storage: "1 TB SSD",
      cost: "$380",
      rationale: "High throughput and isolation for many devices",
    },
    multiTenant: {
      vmSize: "Standard_D4s_v3",
      cpu: "4 vCPU",
      ram: "16 GB",
      storage: "512 GB SSD",
      cost: "$190",
      rationale: "Moderate resource sharing, cost efficient",
    },
  },
  {
    devices: 1000,
    singleTenant: {
      vmSize: "Standard_E8s_v3",
      cpu: "8 vCPU",
      ram: "64 GB",
      storage: "1 TB SSD",
      cost: "$450",
      rationale: "Large memory for heavy workloads",
    },
    multiTenant: {
      vmSize: "Standard_D8s_v3",
      cpu: "8 vCPU",
      ram: "32 GB",
      storage: "1 TB SSD",
      cost: "$380",
      rationale: "Scales well under multi-tenant sharing",
    },
  },
  {
    devices: 5000,
    singleTenant: {
      vmSize: "Standard_E16s_v3",
      cpu: "16 vCPU",
      ram: "128 GB",
      storage: "2 TB SSD",
      cost: "$900",
      rationale: "Handles large scale with isolation",
    },
    multiTenant: {
      vmSize: "Standard_E8s_v3",
      cpu: "8 vCPU",
      ram: "64 GB",
      storage: "1 TB SSD",
      cost: "$450",
      rationale: "Optimized for multi-tenant scaling",
    },
  },
  {
    devices: 10000,
    singleTenant: {
      vmSize: "Standard_E32s_v3",
      cpu: "32 vCPU",
      ram: "256 GB",
      storage: "4 TB SSD",
      cost: "$1800",
      rationale: "Maximum performance and isolation",
    },
    multiTenant: {
      vmSize: "Standard_E16s_v3",
      cpu: "16 vCPU",
      ram: "128 GB",
      storage: "2 TB SSD",
      cost: "$900",
      rationale: "High capacity multi-tenant solution",
    },
  },
];

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#f9fafb",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h3: { fontWeight: 700, letterSpacing: 3 },
  },
});

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

function IiotCalculator() {
  const [machines, setMachines] = useState(25);
  const [avgTags, setAvgTags] = useState(50);
  const [messageSize, setMessageSize] = useState(1); // in KB
  const [frequency, setFrequency] = useState(60); // in seconds
  const [gateways, setGateways] = useState(1);
  const [deploymentType, setDeploymentType] = useState("single");
  const [coldStorageType, setColdStorageType] = useState("s3");

  const totalTags = machines * avgTags;
  const messagesPerDayPerDevice = Math.floor(86400 / frequency);
  const messagesPerDayAllDevices = messagesPerDayPerDevice * machines;
  const messagesPerMonthAllDevices = messagesPerDayAllDevices * 30;
  const messagesPerYearAllDevices = messagesPerDayAllDevices * 365;

  const dataPerDayGB = (messageSize * messagesPerDayAllDevices) / 1_000_000;
  const dataPerMonthGB = dataPerDayGB * 30;
  const dataPerYearGB = dataPerDayGB * 365;

  const iotCoreCostPerMillion = deploymentType === "single" ? 1.0 : 0.7;
  const s3CostPerGB = 0.023;
  const glacierCostPerGB = 0.004;

  const baseVmCostSingle = 120;
  const baseVmCostMulti = baseVmCostSingle * 0.5;

  const scaleFactor = Math.min(10, machines / 25 + dataPerMonthGB / 100);
  const vmCost =
    deploymentType === "single"
      ? baseVmCostSingle * scaleFactor
      : baseVmCostMulti * scaleFactor;

  const monthlyMessageCost =
    (messagesPerMonthAllDevices / 1_000_000) * iotCoreCostPerMillion;
  const coldStorageCost =
    coldStorageType === "s3"
      ? dataPerMonthGB * s3CostPerGB
      : dataPerMonthGB * glacierCostPerGB;

  const totalMonthlyCost = monthlyMessageCost + coldStorageCost + vmCost;
  const totalYearlyCost = totalMonthlyCost * 12;

  const currentVmConfig =
    vmConfigurations.find((c) => c.devices === machines) || vmConfigurations[0];

  const vmConfigForTenant =
    deploymentType === "single"
      ? currentVmConfig.singleTenant
      : currentVmConfig.multiTenant;

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ mb: 4, color: "primary.main" }}
          >
            AWS IIoT cost Calculator
          </Typography>
        </motion.div>

        {/* Input Form */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 3,
            borderRadius: 3,
            backgroundColor: "background.paper",
          }}
        >
          <Box
            component="form"
            onSubmit={(e) => e.preventDefault()}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {/* Number of Machines */}
            <FormControl fullWidth variant="outlined" size="medium">
              <InputLabel id="machines-label">Number of Machines</InputLabel>
              <Select
                labelId="machines-label"
                id="machines"
                value={machines}
                label="Number of Machines"
                onChange={(e) => setMachines(Number(e.target.value))}
              >
                {machineOptions.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m.toLocaleString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Average Tags per Device */}
            <TextField
              label="Average Tags per Device"
              type="number"
              value={avgTags}
              onChange={(e) => setAvgTags(Math.max(1, Number(e.target.value)))}
              inputProps={{ min: 1 }}
              fullWidth
            />

            {/* Average Message Size (KB) */}
            <TextField
              label="Average Message Size (KB)"
              type="number"
              value={messageSize}
              onChange={(e) =>
                setMessageSize(Math.max(0.1, Number(e.target.value)))
              }
              inputProps={{ min: 0.1, step: 0.1 }}
              fullWidth
            />

            {/* Average Message Frequency (seconds) */}
            <TextField
              label="Average Message Frequency (seconds)"
              type="number"
              value={frequency}
              onChange={(e) =>
                setFrequency(Math.max(1, Number(e.target.value)))
              }
              inputProps={{ min: 1 }}
              fullWidth
            />

            {/* Number of Gateways */}
            <TextField
              label="Number of Gateways"
              type="number"
              value={gateways}
              onChange={(e) => setGateways(Math.max(1, Number(e.target.value)))}
              inputProps={{ min: 1 }}
              fullWidth
            />

            {/* Deployment Type */}
            <FormControl fullWidth>
              <InputLabel id="deployment-label">Deployment Type</InputLabel>
              <Select
                labelId="deployment-label"
                id="deployment-type"
                value={deploymentType}
                label="Deployment Type"
                onChange={(e) => setDeploymentType(e.target.value)}
              >
                <MenuItem value="single">Single Tenant</MenuItem>
                <MenuItem value="multi">Multi Tenant</MenuItem>
              </Select>
            </FormControl>

            {/* Cold Storage Type */}
            <FormControl fullWidth>
              <InputLabel id="coldstorage-label">Cold Storage Type</InputLabel>
              <Select
                labelId="coldstorage-label"
                id="cold-storage-type"
                value={coldStorageType}
                label="Cold Storage Type"
                onChange={(e) => setColdStorageType(e.target.value)}
              >
                <MenuItem value="s3">Amazon S3</MenuItem>
                <MenuItem value="glacier">Amazon Glacier</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Results */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${machines}-${deploymentType}-${coldStorageType}`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeIn}
            transition={{ duration: 0.4 }}
          >
            <Paper
              elevation={3}
              sx={{ p: 4, borderRadius: 3, backgroundColor: "background.paper" }}
            >
              <Typography variant="h5" gutterBottom>
                Summary
              </Typography>

              <TableContainer>
                <Table size="small" aria-label="summary table">
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Tags (Devices × Tags)</TableCell>
                      <TableCell align="right">{totalTags.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Messages per Day (All Devices)</TableCell>
                      <TableCell align="right">
                        {messagesPerDayAllDevices.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Data per Day (GB)</TableCell>
                      <TableCell align="right">{dataPerDayGB.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>IoT Core Monthly Cost</TableCell>
                      <TableCell align="right">
                        ${monthlyMessageCost.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Cold Storage Monthly Cost</TableCell>
                      <TableCell align="right">${coldStorageCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Total Estimated Monthly Cost</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>${totalMonthlyCost.toFixed(2)}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Estimated Yearly Cost</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>${totalYearlyCost.toFixed(2)}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* VM Details Table */}
              <Box mt={5}>
                <Typography variant="h6" gutterBottom>
                  VM Details
                </Typography>
                <TableContainer>
                  <Table size="small" aria-label="vm details table">
                    <TableHead>
                      <TableRow>
                        <TableCell>VM Size</TableCell>
                        <TableCell>CPU</TableCell>
                        <TableCell>RAM</TableCell>
                        <TableCell>Storage</TableCell>
                        <TableCell>Monthly Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{vmConfigForTenant.vmSize}</TableCell>
                        <TableCell>{vmConfigForTenant.cpu}</TableCell>
                        <TableCell>{vmConfigForTenant.ram}</TableCell>
                        <TableCell>{vmConfigForTenant.storage}</TableCell>
                        <TableCell>{vmConfigForTenant.cost}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Typography variant="body2" color="text.secondary">
                            VM Rationale: {vmConfigForTenant.rationale}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
          </motion.div>
        </AnimatePresence>
      </Container>
    </ThemeProvider>
  );
}

export default IiotCalculator;
