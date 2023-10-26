import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useRouteTitle from "../../hooks/useRouteTitle";

import Button from "@mui/material/Button";
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';

import UploadFileIcon from '@mui/icons-material/UploadFile';
import DnsIcon from '@mui/icons-material/Dns';
import StorageIcon from "@mui/icons-material/Storage";

import List from "@mui/material/List";
import ListItemButton from '@mui/material/ListItemButton';
import ListItem from "@mui/material/ListItem";

import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";

import ModalLayoutComponent from '../layout/ModalLayoutComponent';

function getDomain(url) {

    if (url.indexOf('.') == -1) return url;
    for (var i = url.length - 1; i >= 0; i--) {
        if(url[i] == '.') {
            return url.substr(0,i);
        }
    }
}

export default function SelectAccountType(props) {

  const server = useSelector((state) => state.server);
  const titleObject = useRouteTitle();

  return (
    <ModalLayoutComponent
      title={titleObject.title}
      content={<>
        <main className="layout_content">
          <Container>
            <List
              subheader={
                <ListSubheader disableSticky={true}>Log in to a server</ListSubheader>
              }
            >
              <ListItemButton component={Link} to="/login">
                <ListItemIcon>
                  <DnsIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`${getDomain(server.name).replace(/^\w/, c => c.toUpperCase())}`}
                  secondary={`Connect to the${server.isOfficial ? ' official ' : ' '}${server.name} instance`}
                />
              </ListItemButton>
              <ListItemButton component={Link} to="/server">
                <ListItemIcon>
                  <StorageIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Change server"
                  secondary={`Define your own backend instance to connect`}
                />
              </ListItemButton>
            </List>
            <List
              subheader={
                <ListSubheader disableSticky={true}>On device only</ListSubheader>
              }
            >
              <ListItemButton component={Link} to="/import-account">
                <ListItemIcon>
                  <UploadFileIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Import .json file"
                  secondary={`Import a .json file generated by the export feature of seven23`}
                />
              </ListItemButton>
            </List>
          </Container>
        </main>
      </>}
      footer={<>
        <Stack direction='row' spacing={2} style={{ justifyContent: 'space-between'}}>
          <Link to="/" tabIndex={-1}>
            <Button
              fullWidth
              color='inherit'
              variant="text"
            >
              Cancel
            </Button>
          </Link>
        </Stack>
      </>}
    />
  );
}