import React from "react";
import { useNavigate } from "react-router-dom";

import { Alert, AlertTitle } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import './Welcome.scss';

export default function Welcome(props) {

  const navigate = useNavigate();

  return (
    <Box className={`welcomeDashboard ${props.className}`}>
      <Typography variant="h6">Welcome to your new account</Typography>
    </Box>
  );
}