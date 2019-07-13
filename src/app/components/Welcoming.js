import "./Welcoming.scss";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import SelectMode from "./welcoming/SelectMode";
import CreateAccount from "./welcoming/CreateAccount";

export default function Welcoming(props) {
  const [step, setStep] = useState("");

  const STEPS = {
    SELECT_MODE: {
      component: <SelectMode setStep={setStep} />
    },
    CREATE_ACCOUNT: {
      component: <CreateAccount setStep={setStep} />
    }
  };

  useEffect(() => {
    setTimeout(() => setStep("SELECT_MODE"), 10);
  }, []);

  return (
    <div className="welcoming__wrapper">
      <div
        className={`welcoming__step ${
          step == "SELECT_MODE" ? "open" : "backward"
        }`}
      >
        {STEPS["SELECT_MODE"].component}
      </div>
      <div
        className={`welcoming__step ${
          step == "CREATE_ACCOUNT" ? "open" : "forward"
        }`}
      >
        {STEPS["CREATE_ACCOUNT"].component}
      </div>
    </div>
  );
}
