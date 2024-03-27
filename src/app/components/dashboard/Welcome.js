import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import "./Welcome.scss";

export default function Welcome(props) {
  return (
    <Box className={`welcomeDashboard ${props.className}`}>
      <Typography variant="h6">Welcome to your new account</Typography>
    </Box>
  );
}
