import { useSelector } from "react-redux";

import Container from "@mui/material/Container";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
Stack;

import ModalLayoutComponent from "../layout/ModalLayoutComponent";

export default function TermsAndConditions(props) {
  const server = useSelector((state) => state.server);

  const handleCancel = () => {
    props.onClose();
  };

  return (
    <ModalLayoutComponent
      title={"Terms and conditions"}
      content={
        <>
          <div>
            <Container
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                paddingBottom: 80,
              }}
            >
              <div
                style={{
                  overflow: "auto",
                  margin: "0px 0",
                  padding: "0px 6px 5px 0px",
                  textAlign: "justify",
                  fontSize: "0.9rem",
                }}
                dangerouslySetInnerHTML={{
                  __html: server.terms_and_conditions,
                }}
              />
            </Container>
          </div>
        </>
      }
      footer={
        <>
          <Stack>
            <Button color="inherit" onClick={() => handleCancel()}>
              Cancel
            </Button>
          </Stack>
        </>
      }
    />
  );
}
