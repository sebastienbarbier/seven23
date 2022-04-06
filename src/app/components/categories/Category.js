import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@material-ui/styles";

import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
import Popover from "@material-ui/core/Popover";
import Button from "@material-ui/core/Button";
import ExpandMore from "@material-ui/icons/ExpandMore";

import StatisticsActions from "../../actions/StatisticsActions";
import TransactionTable from "../transactions/TransactionTable";

import CategoryActions from "../../actions/CategoryActions";

export function Category(props) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigate = useNavigate();

  const [menu, setMenu] = useState(null);
  const [category, setCategory] = useState(props.category);
  const [transactions, setTransactions] = useState(null);

  function performSearch() {
    dispatch(StatisticsActions.perCategory(props.category.id))
      .then(args => {
        if (args && args.transactions && Array.isArray(args.transactions)) {
          setTransactions(args.transactions);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  useEffect(() => {
    if (category.id != props.category.id) {
      setTransactions(null);
      performSearch();
    }
    setCategory(props.category);
  }, [props.category]);

  const reduxTransaction = useSelector(state => state.transactions);

  useEffect(() => {
    if (reduxTransaction) {
      performSearch();
    } else {
      setTransactions(null);
    }
  }, [reduxTransaction]);

  const handleDeleteCategory = (selectedCategory = {}) => {
    dispatch(CategoryActions.delete(selectedCategory.id));
    navigate("/categories/");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          margin: "8px 20px"
        }}
      >
        <h1 className="hideMobile" style={{ width: "100%" }}>
          {category.name}
        </h1>
        <Button onClick={event => setMenu(event.currentTarget)}>
          Edit
          <ExpandMore color="action" />
        </Button>
      </div>

      <div style={{ paddingBottom: 20, margin: "8px 20px" }}>
        {transactions && transactions.length === 0 ? (
          <p>You have no transaction</p>
        ) : (
          <TransactionTable
            transactions={transactions}
            isLoading={!transactions}
            onEdit={props.onEditTransaction}
            onDuplicate={props.onDuplicationTransaction}
            pagination="40"
            dateFormat="DD MMM YY"
          />
        )}
      </div>
      <Popover
        open={Boolean(menu)}
        anchorEl={menu}
        onClose={event => setMenu()}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
      >
        <MenuItem
          onClick={() => {
            setMenu();
            props.onEditCategory(category);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenu();
            props.onEditCategory({ parent: category.id });
          }}
        >
          Add sub category
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setMenu();
            handleDeleteCategory(category);
          }}
        >
          Delete
        </MenuItem>
      </Popover>
    </div>
  );
}