import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function GuardHasNomadList({ children }) {
  const hasNomadList = useSelector((state) =>
    state.user.socialNetworks
      ? state.user.socialNetworks.nomadlist || null
      : null
  );

  if (hasNomadList) {
    return children;
  } else {
    return <Navigate to="/" />;
  }
}
