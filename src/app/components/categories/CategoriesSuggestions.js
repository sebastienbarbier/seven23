import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import AppActions from "../../actions/AppActions";
import CategoryActions from "../../actions/CategoryActions";

export default function CategoriesSuggestions(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const categories_length = useSelector(
    (state) => state.categories.list.length
  );

  const us_model = [
    {
      name: "Food",
      children: [
        {
          name: "Food at home",
          children: [
            { name: "Cereals and bakery products" },
            { name: "Meats, poultry, fish, and eggs" },
            { name: "Dairy products" },
            { name: "Fruits and vegetables" },
            { name: "Other food at home" },
          ],
        },
        { name: "Food away from home" },
      ],
    },
    { name: "Alcoholic beverages" },
    {
      name: "Housing",
      children: [
        {
          name: "Shelter",
          children: [
            { name: "Owned dwellings" },
            { name: "Rented dwellings" },
            { name: "Other lodging" },
          ],
        },
        { name: "Utilities, fuels, and public services" },
        { name: "Household operations" },
        { name: "Housekeeping supplies" },
        { name: "Household furnishings and equipment" },
      ],
    },
    { name: "Apparel and services" },
    {
      name: "Transportation",
      children: [
        { name: "Vehicle purchases (net outlay)" },
        { name: "Gasoline, other fuels, and motor oil" },
        { name: "Other vehicle expenses" },
        { name: "Public and other transportation" },
      ],
    },
    { name: "Healthcare" },
    { name: "Entertainment" },
    { name: "Personal care products and services" },
    { name: "Reading" },
    { name: "Education" },
    { name: "Tobacco products and smoking supplies" },
    { name: "Miscellaneous" },
    { name: "Cash contributions" },
    {
      name: "Personal insurance and pensions",
      children: [
        { name: "Life and other personal insurance" },
        { name: "Pensions and Social Security" },
      ],
    },
  ];
  const lengthCategories = (model = us_model) => {
    let counter = model.length;
    for (let i = 0; i < model.length; i++) {
      if (model[i].children) {
        counter = counter + lengthCategories(model[i].children);
      }
    }
    return counter;
  };
  const model_length = useState(() => lengthCategories());

  const create = async (model = us_model, force = false) => {
    if (categories_length > 0 && !force) {
      handleClickOpen();
    } else {
      handleClose();
      await createCategories(model);
      dispatch(AppActions.snackbar("Done"));
    }
  };

  const createCategories = async (model = [], parent = null) => {
    for (let i = 0; i < model.length; i++) {
      const cat = await dispatch(
        CategoryActions.create({
          name: model[i].name,
          parent: parent,
        })
      );
      if (model[i].children) {
        await createCategories(model[i].children, cat.id);
      }
    }
  };

  const printCategories = (model = us_model) => {
    let html = [];
    for (let i = 0; i < model.length; i++) {
      html.push(<li key={`${i}`}>{model[i].name}</li>);
      if (model[i].children) {
        let children = printCategories(model[i].children);
        html.push(<ul key={`${model[i].name}-${i}`}>{children}</ul>);
      }
    }
    return html;
  };

  // Dialog code
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="categoryList">
      <header className="primaryColor">
        <h1 className="hideMobile">Suggestions</h1>
      </header>

      <Box className="paper">
        <Stack
          direction="column"
          sx={{ paddingTop: 2, marginLeft: 2, marginRight: 2 }}
        >
          <div style={{ paddingBottom: 20, margin: "8px 20px" }}>
            <ul>{printCategories()}</ul>
            <Button
              variant="contained"
              disableElevation
              onClick={() => create()}
            >
              Create {model_length} categories
            </Button>
            <Box sx={{ fontSize: "0.8rem" }} component="p">
              Source:{" "}
              <a
                href="https://www.bls.gov/opub/reports/consumer-expenditures/2020/home.htm"
                target="_blank"
                rel="noreferrer"
              >
                U.S. Bureau of Labor Statistics [en]
              </a>
            </Box>
            {/*<p>Alternative options: <a href="https://www.insee.fr/fr/statistiques/2385823" target="_blank">Insee [fr]</a></p>*/}
          </div>
        </Stack>
      </Box>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          You already have categories
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            By confirming, you will be adding {model_length} categories to the
            existing one.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={() => create(us_model, true)} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
