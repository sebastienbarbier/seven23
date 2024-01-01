/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import Card from "@mui/material/Card";

import "./ModalComponent.scss";

export default function ModalComponent(props) {
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

  return (
    <div className={"modalContent " + (isModalOpen ? "open" : "")}>
      <Card square className="modalContentCard">
        {modalComponent}
      </Card>
    </div>
  );
}
