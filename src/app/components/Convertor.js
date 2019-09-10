/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "../router";

export default function Convertor(props) {
  const dispatch = useDispatch();
  const { history } = useRouter();

  return (
    <div>
      <p>Convertor page</p>
    </div>
  );
}
