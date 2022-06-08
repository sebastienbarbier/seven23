import React from "react";

import Button from "@mui/material/Button";

export default function SelectMode(props) {
  return (
    <div className="welcoming__layout">
      <header>
        <h2>Welcome on board 🥳</h2>
      </header>
      <div className="content">
        <p>
          <strong>Seven23</strong> is a <strong>fully manual budget app</strong>{" "}
          to track personal expenses. It is completely{" "}
          <strong>opensource</strong>, with <strong>privacy by design</strong>.
        </p>
        <p>
          You will need to create an account to start tracking your expenses.
        </p>
      </div>
      <footer>
        <Button
          variant="text"
          onClick={() => props.setStep("CREATE_ACCOUNT")}
        >
          On device for now
        </Button>
        <Button
          variant="contained"
          onClick={() => props.setStep("CONNECT")}
        >
          Connect to a server
        </Button>
      </footer>
    </div>
  );
}