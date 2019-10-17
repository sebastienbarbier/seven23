import "./Welcoming.scss";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import SelectMode from "./welcoming/SelectMode";
import CreateAccount from "./welcoming/CreateAccount";
import ConnectToAServer from "./welcoming/ConnectToAServer";
import ServerForm from "./login/ServerForm";
import SignUpForm from "./login/SignUpForm";
import ForgottenPasswordForm from "./login/ForgottenPasswordForm";

import ServerActions from "../actions/ServerActions";

export default function Welcoming(props) {
  const dispatch = useDispatch();
  const [step, setStep] = useState("");
  const isLogged = useSelector(state => state.server.isLogged);

  const STEPS = {
    SELECT_MODE: {
      component: <SelectMode step={step} setStep={setStep} />
    },
    CREATE_ACCOUNT: {
      component: <CreateAccount step={step} setStep={setStep} />
    },
    CONNECT: {
      component: (
        <ConnectToAServer
          step={step}
          setStep={setStep}
          onClose={props.onClose}
          connectOnly={props.connectOnly}
        />
      )
    },
    SERVER_FORM: {
      component: <ServerForm step={step} setStep={setStep} />
    },
    FORGOTTEN_PASSWORD: {
      component: <ForgottenPasswordForm step={step} setStep={setStep} />
    },
    SIGNUP: {
      component: <SignUpForm step={step} setStep={setStep} />
    }
  };

  useEffect(() => {
    dispatch(ServerActions.init());

    let mode = "CREATE_ACCOUNT";
    if (!isLogged) {
      mode = props.connectOnly ? "CONNECT" : "SELECT_MODE";
    }
    setTimeout(() => setStep(mode), 10);
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
        className={`welcoming__step ${step == "SIGNUP" ? "open" : "forward"}`}
      >
        {STEPS["SIGNUP"].component}
      </div>
    </div>
  );
}
