/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import LinearProgress from "@mui/material/LinearProgress";
import { useSelector } from "react-redux";

import Container from "@mui/material/Container";

import "./ModalLayoutComponent.scss";

export default function ModalLayoutComponent(props) {
  const hasAccount = useSelector(
    (state) => state.accounts.remote.length + state.accounts.local.length >= 1
  );

  return (
    <div className="modalLayoutComponent">
      <header className={!hasAccount ? "showTablet" : ""}>
        <Container>
          <h2>{props.title}</h2>
        </Container>
      </header>
      {props.isLoading && <LinearProgress />}
      <div className="content">
        <div className="contentWrapper">{props.content}</div>
      </div>
      <footer>
        <Container>{props.footer}</Container>
      </footer>
    </div>
  );
}
