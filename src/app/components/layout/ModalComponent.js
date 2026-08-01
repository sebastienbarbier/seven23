/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import Card from "@mui/material/Card";

import AppActions from "../../actions/AppActions";

import "./ModalComponent.scss";

export default function ModalComponent(props) {
  const dispatch = useDispatch();
  const location = useLocation();
  //
  // Modal logic
  //
  const modal = useSelector((state) => state.state.modal);
  const [modalComponent, setModalComponent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = (component) => {
    if (component) {
      setModalComponent(component);
      setIsModalOpen(true);
    } else {
      setTimeout(() => {
        setModalComponent(null);
      }, 200);
      setIsModalOpen(false);
    }
  };

  const handleClose = () => {
    if (isModalOpen) {
      dispatch(AppActions.closeModal());
    }
  };

  useEffect(() => {
    if (modal) {
      toggleModal(modal);
    } else {
      toggleModal();
    }
  }, [modal]);

  useEffect(() => {
    if (isModalOpen) {
      toggleModal();
    }
  }, [location]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      // Nested MUI Dialogs/DatePickers stop Escape; respect that.
      if (event.key === "Escape" && !event.defaultPrevented) {
        dispatch(AppActions.closeModal());
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, dispatch]);

  return (
    <div
      className={"modalContent " + (isModalOpen ? "open" : "")}
      onClick={handleClose}
    >
      <Card
        square
        className="modalContentCard"
        onClick={(event) => event.stopPropagation()}
      >
        {modalComponent}
      </Card>
    </div>
  );
}
