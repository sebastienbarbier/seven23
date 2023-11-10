import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import CategoryActions from "../../actions/CategoryActions";
import AutoCompleteSelectField from "../forms/AutoCompleteSelectField";

import Container from "@mui/material/Container";
import ModalLayoutComponent from '../layout/ModalLayoutComponent';

export default function CategoryForm(props) {
  const dispatch = useDispatch();
  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parent, setParent] = useState("");

  useEffect(() => {
    const category = props.category;

    setId(category?.id || null);
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
    if (name === '') {
      setError({
        name: 'This field is required'
      });
    } else {
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
    }

  };

  return (
    <ModalLayoutComponent
      title={'Category'}
      content={<>
        <Container>
          <form onSubmit={save}>
            <Stack spacing={2} sx={{ marginTop: 2 }}>
              <TextField
                label="Name"
                id="cy_category_name"
                onChange={(event) => setName(event.target.value)}
                disabled={isLoading || !categories}
                value={name}
                error={Boolean(error.name)}
                helperText={error.name}
                style={{ width: "100%" }}
                margin="normal"
              />
              <TextField
                label="Description (optional)"
                id="cy_category_description"
                disabled={isLoading || !categories}
                onChange={(event) => setDescription(event.target.value)}
                value={description}
                style={{ width: "100%" }}
                margin="normal"
              />
              <AutoCompleteSelectField
                label="Sub category of  (optional)"
                id="cy_category_parent"
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
                style={{ textAlign: "left" }}
              />
            </Stack>
          </form>
        </Container>
      </>}
      footer={<>
        <Stack spacing={1} direction="row-reverse" justifyContent='space-between' sx={{ width: '100%' }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={isLoading || isSyncing}
            style={{ marginLeft: "8px" }}
            onClick={save}
          >
            Submit
          </Button>
          <Button color='inherit' onClick={props.onClose}>Cancel</Button>
        </Stack>
      </>}
      isLoading={isLoading || !categories}
    />
  );
}