import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import Stack from "@mui/material/Stack";

export default function CategoriesSuggestions(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <>
      <Stack direction="column" sx={{ paddingTop: 2, marginLeft: 2, marginRight: 2  }}>
        <h1 className="hideMobile" style={{ width: "100%" }}>
          Suggestions
        </h1>

        <div style={{ paddingBottom: 20, margin: "8px 20px" }}>
          <p>Here come the suggestion</p>
        </div>
      </Stack>
    </>
  );
}