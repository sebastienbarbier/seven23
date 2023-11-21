/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import Container from "@mui/material/Container";
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import AddIcon from '@mui/icons-material/Add';

import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";

import EmailIcon from '@mui/icons-material/Email';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';

import AppActions from "../../../actions/AppActions";
import ServerActions from "../../../actions/ServerActions";
import ServerForm from "../../login/ServerForm";

import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import pagination from '../../swiper/Pagination';

import './ServerSelector.scss';

export default function ServerSelector(props) {

  const dispatch = useDispatch();

  const servers = useSelector(state => state.server.servers);
  const selectedServer = useSelector(state => state.server);

  const isLoading = useSelector(state => state.state.isConnecting);

  const [showAddButton, setShowAddButton] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  useEffect(() => {
    setShowAddButton(!props.disableAddAction);
    setShowDeleteButton(servers.find(s => s.url == selectedServer.url) && servers.find(s => s.url == selectedServer.url).isOfficial == undefined);
  }, [props.disableAddAction, selectedServer, servers]);

  const selectServer = (_url) => {
    dispatch(ServerActions.connect(_url)).then(() => {
      if (props.onSelect) {
        props.onSelect();
      }
    }).catch(() => {});
  }

  const deleteServer = (_url) => {
    dispatch(ServerActions.remove(_url));
  }

  const handleChangeServer = (change = null) => {
    dispatch(AppActions.openModal(<ServerForm
      onSubmit={() => dispatch(AppActions.closeModal())}
      onClose={() => dispatch(AppActions.closeModal())}
    />));
  };

  const hideBulletIfOnlyOneSlide = (swiper) => {
    if (swiper.pagination.bullets.length > 1) {
      swiper.pagination.el.style.visibility = 'visible';
    } else if (swiper.pagination.bullets.length <= 1) {
      swiper.pagination.el.style.visibility = 'hidden';
    }
  };

  return (
    <Box sx={props.sx}>
      <Swiper
        className="desktopSwiperStyle"
        pagination={pagination}
        module={[Pagination]}
        slidesPerView={'auto'}
        spaceBetween={10}
        onSwiper={(swiper) => {
          swiper.on('afterInit', hideBulletIfOnlyOneSlide);
          swiper.on('resize', hideBulletIfOnlyOneSlide);
        }}
      >
        { servers && servers.map(server => {
          return <>
            <SwiperSlide className={selectedServer.url == server.url ? `selected` : ''}>
              <button disabled={isLoading} onClick={() => selectServer(server.url)} className="serverButton">
                <p className="name">{ server.name }</p>
                <p className="url">{ server.url }</p>
                { !server.isOfficial && <p className="selfHosted">Self hosted</p> }
              </button>
            </SwiperSlide>
          </>
        }) }

        { (showAddButton || showDeleteButton) && <SwiperSlide className="transparent" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'flex-start',
          background: 'transparent',
          width: '260px',
        }}>
          { showAddButton && <Button
            sx={{
              background: 'transparent',
              textTransform: 'inherit',
              paddingTop: '4px',
              paddingBottom: '4px',
              paddingLeft: '14px',
              paddingRight: '14px',
            }}
            color='inherit'
            disabled={isLoading}
            startIcon={<AddIcon />}
            onClick={() => handleChangeServer()}>Add a server</Button> }
          { showDeleteButton && <Button
            sx={{
              background: 'transparent',
              textTransform: 'inherit',
              paddingTop: '4px',
              paddingBottom: '4px',
              paddingLeft: '14px',
              paddingRight: '14px',
            }}
            color='error'
            disabled={isLoading}
            startIcon={<AddIcon />}
            onClick={() => deleteServer(selectedServer.url)}>Remove selected server</Button> }
        </SwiperSlide> }
      </Swiper>
    </Box>
  );
}