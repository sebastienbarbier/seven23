/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React from "react";

import { Link } from "react-router-dom";

import Container from "@mui/material/Container";
import Button from "@mui/material/Button";

export default function NotFound(props) {
  return (
    <Container>
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist anymore.</p>
      <Link to="/dashboard"><Button>Go to dashboard</Button></Link>
    </Container>
  );
}