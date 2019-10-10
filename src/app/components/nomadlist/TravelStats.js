import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function TravelStats() {
  const nomadlist = useSelector(state =>
    state.user.socialNetworks ? state.user.socialNetworks.nomadlist || {} : {}
  );

  // console.log(nomadlist);

  return <p></p>;
}
