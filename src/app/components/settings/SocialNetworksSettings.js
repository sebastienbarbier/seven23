import "./SocialNetworksSettings.scss";

import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Avatar from "@mui/material/Avatar";
import { useTheme } from "../../theme";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";

import MapIcon from "@mui/icons-material/Map";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import NomadlistForm from "../settings/socialnetworks/NomadlistForm";

import Button from "@mui/material/Button";

import UserActions from "../../actions/UserActions";
import AppActions from "../../actions/AppActions";

export default function SocialNetworksSettings(props) {
  const dispatch = useDispatch();
  const themeObject = useSelector((state) => state.app.theme);
  const theme = useTheme();
  const isConfidential = useSelector((state) => state.app.isConfidential);
  const nomadlist = useSelector((state) =>
    state.user.socialNetworks ? state.user.socialNetworks.nomadlist : null
  );

  const _switchTheme = () => {
    dispatch(UserActions.setTheme(themeObject === "dark" ? "light" : "dark"));
  };

  const _switchVisibility = () => {
    dispatch(AppActions.setConfidential(!isConfidential));
  };

  const _openNomadlist = () => {
    dispatch(AppActions.openModal(
      <NomadlistForm
        onSubmit={() => dispatch(AppActions.closeModal())}
        onClose={() => dispatch(AppActions.closeModal())}
      />
    ));
  };
  const _removeNomadlist = () => {
    dispatch(UserActions.updateNomadlist(null));
  };

  return (
    <div className="layout_content wrapperMobile mobile_footer_padding">
      <Box sx={{
        padding: "10px 20px 40px 20px",
        fontSize: "0.9rem",
      }}>
        <h2>Social networks</h2>
        <p>Connect your different accounts to enhance your data.</p>

        <div>
          <Card sx={{
              maxWidth: 400,
            }}>
            <CardHeader
              avatar={
                <Avatar aria-label="nomadlist" sx={{
                  backgroundColor: theme.palette.brand.nomadlist,
                }}>
                  <MapIcon />
                </Avatar>
              }
              title="Nomadlist"
              subheader="Access your public data to match your expenses with your trips."
            />
            {nomadlist ? (
              <CardActions
                disableSpacing
                className="SocialNetworksSettingsActions"
              >
                <Button
                  size="small"
                  color="primary"
                  href={`https://nomadlist.com/@${nomadlist["username"]}`}
                >
                  @{nomadlist["username"]}
                  <OpenInNewIcon sx={{
                      fontSize: 16,
                      marginLeft: theme.spacing(1),
                    }} />
                </Button>
                <div>
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => _removeNomadlist()}
                    style={{ marginRight: 10 }}
                  >
                    Remove
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={() => _openNomadlist()}
                  >
                    Edit
                  </Button>
                </div>
              </CardActions>
            ) : (
              <CardActions disableSpacing>
                <div></div>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => _openNomadlist()}
                >
                  Set username
                </Button>
              </CardActions>
            )}
          </Card>
        </div>
      </Box>
    </div>
  );
}