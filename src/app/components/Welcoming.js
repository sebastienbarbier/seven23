import "./Welcoming.scss";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import SelectMode from "./welcoming/SelectMode";
import CreateAccount from "./welcoming/CreateAccount";
import ConnectToAServer from "./welcoming/ConnectToAServer";
import ServerForm from "./login/ServerForm";

export default function Welcoming(props) {
  const [step, setStep] = useState("");

  const STEPS = {
    SELECT_MODE: {
      component: <SelectMode setStep={setStep} />
    },
    CREATE_ACCOUNT: {
      component: <CreateAccount setStep={setStep} />
    },
    CONNECT: {
      component: <ConnectToAServer setStep={setStep} />
    },
    SERVER_FORM: {
      component: <ServerForm setStep={setStep} />
    },
    FORGOTTEN_PASSWORD: {
      component: <ServerForm setStep={setStep} />
    },
    SIGNIN: {
      component: <ServerForm setStep={setStep} />
    }
  };

  useEffect(() => {
    setTimeout(() => setStep("SERVER_FORM"), 10);
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
      <div
        className={`welcoming__step ${step == "CONNECT" ? "open" : "forward"}`}
      >
        {STEPS["CONNECT"].component}
      </div>
      <div
        className={`welcoming__step ${
          step == "SERVER_FORM" ? "open" : "forward"
        }`}
      >
        {STEPS["SERVER_FORM"].component}
      </div>
      <div
        className={`welcoming__step ${
          step == "FORGOTTEN_PASSWORD" ? "open" : "forward"
        }`}
      >
        {STEPS["FORGOTTEN_PASSWORD"].component}
      </div>
      <div
        className={`welcoming__step ${step == "SIGNIN" ? "open" : "forward"}`}
      >
        {STEPS["SIGNIN"].component}
      </div>
    </div>
  );
}
