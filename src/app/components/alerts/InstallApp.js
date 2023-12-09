import React from "react";
import { useDispatch } from "react-redux";

import { Alert, AlertTitle } from '@mui/material';
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import './alerts.scss';

export default function InstallApp(props) {

  const dispatch = useDispatch()

  return (
    <Alert
      icon={<AutoAwesomeIcon fontSize="inherit" />}
      severity="info"
      onClose={() => {
        props.onClose && props.onClose();
      }}
      sx={{ width: '100%' }}
      >
        <Box sx={{ width: '100%' }}>
          Install seven23 on your device as a progressive web app
        </Box>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', pt: 0 }}>
          <Link tabIndex={-1} to={props.link  || `/how-to-install`}>
            <Button color="inherit" size="small" sx={{ whiteSpace: 'nowrap' }}>
              Install now
            </Button>
          </Link>
        </Box>
      </Alert>
  );
}