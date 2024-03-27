/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { Link } from "react-router-dom";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";

import ResetPasswordForm from "./login/ResetPasswordForm";

import ModalLayoutComponent from "./layout/ModalLayoutComponent";

export default function ResetPassword(props) {

  return (
    <>
      <ModalLayoutComponent
        title={"Reset Password"}
        content={
          <>
            <Container sx={{ pt: 3 }}>
              <ResetPasswordForm />
            </Container>
          </>
        }
        footer={
          <>
            <Stack
              direction="row"
              spacing={2}
              style={{ justifyContent: "space-between" }}
            >
              <Link to="/" tabIndex={-1}>
                <Button fullWidth color="inherit" variant="text">
                  Cancel
                </Button>
              </Link>
            </Stack>
          </>
        }
      />
    </>
  );
}
