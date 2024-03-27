/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Reset(props) {
  const navigate = useNavigate();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }

  useEffect(() => {
    navigate("/");
  }, []);

  return <div />;
}
