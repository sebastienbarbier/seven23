import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function GuardHasNoAccount({ children }) {
  const hasAccount = useSelector(
    (state) => state.accounts.remote.length + state.accounts.local.length >= 1
  );

  if (hasAccount) {
    return <Navigate to="/dashboard" />;
  } else {
    return children;
  }
}
