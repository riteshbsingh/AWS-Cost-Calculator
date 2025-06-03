import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Modal,
  TextField,
} from '@mui/material';
import {
  Delete,
  Add,
} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3
};

const Wallets = () => {
  const [wallets] = useState([
    { id: 1, name: 'BITCOIN', symbol: 'BTC', amount: '0.00256', icon: 'B' },
    { id: 2, name: 'BITCOIN 1', symbol: 'BTC', amount: '0.00256', icon: 'B' },
    { id: 3, name: 'BITCOIN 2', symbol: 'BTC', amount: '0.00256', icon: 'B' },
    { id: 4, name: 'BITCOIN 3', symbol: 'BTC', amount: '0.00256', icon: 'B' },
    { id: 5, name: 'BITCOIN 4', symbol: 'BTC', amount: '0.00256', icon: 'B' },
  ]);

  const [open, setOpen] = React.useState(false);
  const handleImportWallet = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDeleteWallet = (id) => {
    console.log('Delete wallet:', id);
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3, ml: 5, display: "flex", flexDirection: 'column', justifyContent: 'center', height: '90vh' }}>
      {/* Title and Import Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'text.secondary' }}>
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add sx={{ borderRadius: 100, bgcolor: "#B29C7C", color: 'white' }} />}
          onClick={handleImportWallet}
          sx={{
            color: 'text.secondary',
            bgcolor: "#151C24",
            fontWeight: 'medium',
            textTransform: 'none',
            borderRadius: 2
          }}
        >
          IMPORT WALLET
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} >
              <Typography id="modal-modal-title" variant="h6" component="h2">
              </Typography>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Import Wallet
              </Typography>
              <IconButton onClick={handleClose} aria-label="delete">
                <CloseIcon />
              </IconButton>
            </Box>

            <Box>
              <Box>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                  Enter your wallet name :
                </Typography>
                <TextField id="outlined-basic" fullWidth variant="outlined" />
              </Box>

              <Box>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                  Enter your Mnemonic :
                </Typography>
                <TextField id="outlined-basic" fullWidth multiline
                  rows={4} variant="outlined" />
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button variant="contained" sx={{ color: 'white' }} >Submit</Button>
            </Box>
          </Box>
        </Modal>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'text.secondary' }}>
          Total Wallets - {wallets.length}
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

export default Wallets