/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from 'react-router-dom';

import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import ResetPasswordForm from "./login/ResetPasswordForm";

export default function ResetPassword(props) {
  const dispatch = useDispatch();

  return <div className="layout dashboard mobile">
    <header className="layout_header">
      <Container className="layout_header_top_bar">
        <h2>Reset Password</h2>
      </Container>
    </header>
    <main className="layout_content">
      <Container>
        <ResetPasswordForm />
      </Container>
    </main>
    <footer className="layout_footer">
      <Container>
        <Stack direction='row' spacing={2} style={{ justifyContent: 'space-between'}}>
          <Link to="/" tabIndex={-1}>
            <Button
              fullWidth
              color='inherit'
              variant="text"
            >
              Cancel
            </Button>
          </Link>
        </Stack>
      </Container>
    </footer>
  </div>;
}
