import { Alert } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import "./alerts.scss";

export default function InstallApp(props) {
  return (
    <Alert
      icon={<AutoAwesomeIcon fontSize="inherit" />}
      severity="info"
      className={props.className}
      onClose={() => (props.onClose ? props.onClose() : false)}
      sx={{ ...props.sx, width: "100%" }}
    >
      <Box sx={{ width: "100%" }}>
        Install seven23 on your device as a progressive web app
      </Box>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          pt: 0,
        }}
      >
        <Link tabIndex={-1} to={props.link || "/how-to-install"}>
          <Button color="inherit" size="small" sx={{ whiteSpace: "nowrap" }}>
            Install now
          </Button>
        </Link>
      </Box>
    </Alert>
  );
}
