import React from "react";

import Button from "@material-ui/core/Button";

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
          variant="contained"
          onClick={() => props.setStep("CREATE_ACCOUNT")}
        >
          Use on device only
        </Button>
        <Button variant="contained" color="primary" disabled>
          Connect to a server
        </Button>
      </footer>
    </div>
  );
}
