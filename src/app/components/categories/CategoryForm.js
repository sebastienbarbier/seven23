import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";

import CategoryActions from "../../actions/CategoryActions";
import AutoCompleteSelectField from "../forms/AutoCompleteSelectField";

export default function CategoryForm(props) {
  const dispatch = useDispatch();
  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parent, setParent] = useState("");

  useEffect(() => {
    const category = props.category;

    setId(category.id || null);
    setName(category.name || "");
    setDescription(category.description || "");
    setParent(category.parent || "");
  }, [props.category]);

  const account = useSelector((state) => state.account);
  const categories = useSelector((state) =>
    state.categories ? state.categories.list : []
  );
  const isSyncing = useSelector((state) => state.state.isSyncing);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState({});

  const save = (event) => {
    if (event) {
      event.preventDefault();
    }
    if (isSyncing) {
      return;
    }

    setError({});
    setIsLoading(true);

    let category = {
      id: id,
      name: name,
      account: account.id,
      description: description,
      parent: parent,
    };

    if (category.parent === null) {
      delete category.parent;
    }

    let promise;

    if (id) {
      promise = dispatch(CategoryActions.update(category));
    } else {
      promise = dispatch(CategoryActions.create(category));
    }

    promise
      .then(() => {
        setError({});
        setIsLoading(false);
        props.onSubmit(category);
      })
      .catch((error) => {
        setError(error);
        setIsLoading(false);
      });
  };

  return (
    <form onSubmit={save} className="content">
      <header>
        <h2 style={{ color: "white" }}>Category</h2>
      </header>

      {isLoading || !categories ? <LinearProgress mode="indeterminate" /> : ""}
      <div className="form">
        <TextField
          label="Name"
          onChange={(event) => setName(event.target.value)}
          disabled={isLoading || !categories}
          value={name}
          error={Boolean(error.name)}
          helperText={error.name}
          style={{ width: "100%" }}
          margin="normal"
          variant="standard"
        />
        <br />
        <TextField
          label="Description"
          disabled={isLoading || !categories}
          onChange={(event) => setDescription(event.target.value)}
          value={description}
          style={{ width: "100%" }}
          margin="normal"
          variant="standard"
        />
        <AutoCompleteSelectField
          label="Sub category of"
          disabled={isLoading || !categories}
          value={
            parent
              ? categories.find((category) => {
                  return category.id === parent;
                })
              : ""
          }
          values={categories || []}
          error={Boolean(error.parent)}
          helperText={error.parent}
          onChange={(payload) => setParent(payload ? payload.id : null)}
          maxHeight={400}
          fullWidth={true}
          className="parent"
          variant="standard"
          style={{ textAlign: "left" }}
        />
      </div>

      <footer>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isLoading || isSyncing}
          style={{ marginLeft: "8px" }}
        >
          Submit
        </Button>
      </footer>
    </form>
  );
}