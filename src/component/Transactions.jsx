import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Delete,
} from '@mui/icons-material';

const Transactions = () => {
  const [wallets] = useState([
      { id: 1, name: 'BITCOIN', symbol: 'BTC', amount: '0.00256', icon: 'B' },
      { id: 2, name: 'BITCOIN 1', symbol: 'BTC', amount: '0.00256', icon: 'B' },
      { id: 3, name: 'BITCOIN 2', symbol: 'BTC', amount: '0.00256', icon: 'B' },
      { id: 4, name: 'BITCOIN 3', symbol: 'BTC', amount: '0.00256', icon: 'B' },
      { id: 5, name: 'BITCOIN 4', symbol: 'BTC', amount: '0.00256', icon: 'B' },
    ]);

  return (
   <Box component="main" sx={{ flexGrow: 1, p: 3, ml: 5, display: "flex", flexDirection: 'column', justifyContent: 'center', height: '90vh' }}>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: 'text.secondary' }}>
              Total Transactions - {wallets.length}
            </Typography>
          </Box>

          {/* Wallets Table */}
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: '#151C24',
              borderRadius: 2,
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'medium', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Coin
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'medium', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Holding
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: 'text.secondary', fontWeight: 'medium', textTransform: 'uppercase', fontSize: '0.75rem' }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {wallets.map((wallet) => (
                  <TableRow
                    key={wallet.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#1f2937',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: 'primary.main',
                            color: 'black',
                            fontWeight: 'bold',
                            mr: 2,
                          }}
                        >
                          {wallet.icon}
                        </Avatar>
                        <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                          {wallet.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {wallet.symbol} {wallet.amount}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleDeleteWallet(wallet.id)}
                        sx={{
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'error.main',
                          },
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
  )
}

export default Transactions