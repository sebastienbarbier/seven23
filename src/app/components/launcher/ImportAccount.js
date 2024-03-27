import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

import Stack from "@mui/material/Stack";

import { Link } from "react-router-dom";
import ImportAccount from "../settings/accounts/ImportAccount";

import useRouteTitle from "../../hooks/useRouteTitle";

import ModalLayoutComponent from "../layout/ModalLayoutComponent";

export default function CreateAccount(props) {
  const navigate = useNavigate();
  const titleObject = useRouteTitle();

  return (
    <ModalLayoutComponent
      title={titleObject.title}
      content={
        <>
          <main className="" style={{ display: "flex" }}>
            <ImportAccount
              onImport={() => {
                navigate("/dashboard");
              }}
            />
          </main>
        </>
      }
      footer={
        <>
          <Stack
            direction="row"
            spacing={2}
            style={{ justifyContent: "space-between" }}
          >
            <Link to="/login">
              <Button fullWidth color="inherit" variant="text">
                Cancel
              </Button>
            </Link>
          </Stack>
        </>
      }
    />
  );
}
