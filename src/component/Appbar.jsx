import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  AccountBalanceWallet,
  SwapHoriz,
  Support
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CachedIcon from '@mui/icons-material/Cached';
import Wallets from './Wallets';
import Transactions from './Transactions';

// Dark theme configuration
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#B29C7C', // Yellow
    },
    secondary: {
      main: '#4C3D2B', // Green
    },
    background: {
      default: '#0A1018',
      paper: '#151C24',
    },
    text: {
      primary: '#d1d5db',
      secondary: '#9ca3af',
    },
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
  },
});

const WalletDashboard = () => {
  const [wallets] = useState([
    { id: 1, name: 'BITCOIN', symbol: 'BTC', amount: '0.00256', icon: 'B' },
    { id: 2, name: 'BITCOIN 1', symbol: 'BTC', amount: '0.00256', icon: 'B' },
    { id: 3, name: 'BITCOIN 2', symbol: 'BTC', amount: '0.00256', icon: 'B' },
    { id: 4, name: 'BITCOIN 3', symbol: 'BTC', amount: '0.00256', icon: 'B' },
    { id: 5, name: 'BITCOIN 4', symbol: 'BTC', amount: '0.00256', icon: 'B' },
  ]);

  const [selectedItem, setSelectedItem] = useState('wallets');

  const sidebarItems = [
    { id: 'wallets', label: 'Wallets', icon: <AccountBalanceWallet /> },
    { id: 'transactions', label: 'Last Transactions', icon: <SwapHoriz sx={{ transform: 'rotate(90deg)' }} /> },
  ];

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#0A1018', borderBottom: '1px solid #151C24' }}>
          {/* Header */}
          <Typography></Typography>
          <Button variant="outlined" startIcon={<CachedIcon />} sx={{ borderRadius: 10 }} >
            Synced
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex' }}>
        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              maxHeight: '80%',
              boxSizing: 'border-box',
              backgroundColor: '#151C24',
              border: '1px solid #374151',
              margin: '7rem 0rem',
              marginLeft: 3,
              marginBottom: 3,
              borderRadius: 10
            },
          }}
        >
          <Box sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%', pt: 5 }}>
            {/* Navigation */}
            <List sx={{ flexGrow: 1 }}>
              {sidebarItems.map((item) => (
                <ListItem
                  key={item.id}
                  button="true"
                  onClick={() => setSelectedItem(item.id)}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: selectedItem === item.id ? '#1f2937' : 'transparent',
                    color: selectedItem === item.id ? 'primary.main' : 'text.secondary',
                    '&:hover': {
                      backgroundColor: '#1f2937',
                      color: 'primary.main',
                      cursor: 'pointer'
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </List>

            {/* Support Button */}
            <Button
              variant="outlined"
              startIcon={<Support />}
              sx={{
                color: 'text.secondary',
                borderColor: '#374151',
                backgroundColor: '#4C3D2B',
                '&:hover': {
                  borderColor: '#4b5563',
                },
                p: 1
              }}
            >
              Support
            </Button>
          </Box>
        </Drawer>

        {/* Main Content */}
        {selectedItem === "wallets" ? <Wallets /> : <Transactions /> }
      </Box>
    </ThemeProvider>
  );
};

export default WalletDashboard;