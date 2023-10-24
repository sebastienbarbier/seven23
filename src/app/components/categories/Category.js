import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import ExpandMore from "@mui/icons-material/ExpandMore";

import CategoryForm from "./CategoryForm";

import StatisticsActions from "../../actions/StatisticsActions";
import TransactionTable from "../transactions/TransactionTable";
import TransactionForm from "../transactions/TransactionForm";

import CategoryActions from "../../actions/CategoryActions";
import AppActions from "../../actions/AppActions";

export function Category(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const [menu, setMenu] = useState(null);
  const [category, setCategory] = useState(null);
  const [transactions, setTransactions] = useState(null);

  function performSearch(category) {
    dispatch(StatisticsActions.perCategory(category.id))
      .then(args => {
        if (args && args.transactions && Array.isArray(args.transactions)) {
          setTransactions(args.transactions);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  // When params id change, we get new Category object
  useEffect(() => {
    setCategory(null);
    setTransactions(null);
    dispatch(CategoryActions.get(params.id)).then((category = { id: 'null', name: 'Without a category' }) => {
      setCategory(category);
      performSearch(category);
    })
  }, [params.id]);

  const reduxTransaction = useSelector(state => state.transactions);
  useEffect(() => {
    if (reduxTransaction && category) {
      performSearch(category);
    } else {
      setTransactions(null);
    }
  }, [reduxTransaction]);

  const onEditCategory = (category = {}) => {
    dispatch(AppActions.openModal(<CategoryForm
        category={category}
        onSubmit={() => dispatch(AppActions.closeModal())}
        onClose={() => dispatch(AppActions.closeModal())}
      />));
  };

  const onEditTransaction = (transaction = {}) => {
    dispatch(AppActions.openModal(<TransactionForm
        transaction={transaction}
        onSubmit={() => dispatch(AppActions.closeModal())}
        onClose={() => dispatch(AppActions.closeModal())}
      />));
  };

  const onDuplicationTransaction = (transaction = {}) => {
    const newTransaction = Object.assign({}, transaction);
    delete newTransaction.id;
    delete newTransaction.date;
    onEditTransaction(newTransaction);
  };

  const handleDeleteCategory = (selectedCategory = {}) => {
    dispatch(CategoryActions.delete(selectedCategory.id));
    navigate("/categories/");
  };

  return (
    <div>
     { category && <div
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
        { category.id != 'null' && <Button color='inherit' onClick={event => setMenu(event.currentTarget)}>
          Edit
          <ExpandMore color="action" />
        </Button>}
      </div>

      }

      <div style={{ paddingBottom: 20, margin: "8px 20px" }}>
        {transactions && transactions.length === 0 ? (
          <p>You have no transaction</p>
        ) : (
          <TransactionTable
            transactions={transactions}
            isLoading={!transactions}
            onEdit={onEditTransaction}
            onDuplicate={onDuplicationTransaction}
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
            onEditCategory(category);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenu();
            onEditCategory({ parent: category.id });
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