/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "@material-ui/styles";
import { withTheme } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";

import Card from "@material-ui/core/Card";
import Fab from "@material-ui/core/Fab";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SearchIcon from "@material-ui/icons/Search";

import InputBase from "@material-ui/core/InputBase";
import Popover from "@material-ui/core/Popover";

import Switch from "@material-ui/core/Switch";

import Slide from "@material-ui/core/Slide";
import Button from "@material-ui/core/Button";

import IconButton from "@material-ui/core/IconButton";

import red from "@material-ui/core/colors/red";

import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import UndoIcon from "@material-ui/icons/Undo";
import ContentAdd from "@material-ui/icons/Add";
//
import CategoryActions from "../actions/CategoryActions";

import { Category } from "./categories/Category";
import CategoryForm from "./categories/CategoryForm";

import TransactionForm from "./transactions/TransactionForm";
import UserButton from "./settings/UserButton";

import { fuzzyFilter } from "./search/utils";

const styles = {
  button: {
    float: "right",
    marginTop: "26px"
  },
  listItem: {
    paddingLeft: "14px"
  },
  listItemDeleted: {
    paddingLeft: "14px",
    color: red[500]
  }
};

const Categories = withRouter(({ match, history }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const categories = useSelector(state =>
    state.categories ? state.categories.list : null
  );
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [category, setCategory] = useState(() =>
    categories ? categories.find(c => c.id === parseInt(match.params.id)) : null
  );
  const [categoryName, setCategoryName] = useState(
    category ? category.name : ""
  );

  const [menu, setMenu] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [component, setComponent] = useState(null);
  const [search, setSearch] = useState("");

  const [showDeletedCategories, setShowDeletedCategories] = useState(false);

  useEffect(() => {
    if (!match.params.id) {
      setCategory(null);
    } else {
      setCategoryName(category ? category.name : "");
    }
  }, [match.params.id]);

  useEffect(() => {
    if (search) {
      setFilteredCategories(
        categories
          ? categories.filter(category => {
              return fuzzyFilter(search || "", category.name);
            })
          : null
      );
    } else {
      setFilteredCategories(categories);
    }
  }, [search, categories]);

  // Update category
  useEffect(() => {
    if (category && categories) {
      setCategory(categories.find(c => c.id === category.id));
    }
  }, [categories]);

  const handleOpenCategory = category => {
    const component = (
      <CategoryForm
        category={category}
        onSubmit={() => setIsOpen(false)}
        onClose={() => setIsOpen(false)}
      />
    );
    setComponent(component);
    setIsOpen(true);
  };

  const handleEditTransaction = (transaction = {}) => {
    const component = (
      <TransactionForm
        transaction={transaction}
        onSubmit={() => setIsOpen(false)}
        onClose={() => setIsOpen(false)}
      />
    );
    setComponent(component);
    setIsOpen(true);
  };

  const handleDuplicateTransaction = (transaction = {}) => {
    const newTransaction = Object.assign({}, transaction);
    delete newTransaction.id;
    delete newTransaction.date;
    handleEditTransaction(newTransaction);
  };

  const _handleUndeleteCategory = category => {
    category.active = true;
    dispatch(CategoryActions.update(category));
  };

  const drawListItem = (categories, parent = null, indent = 0) => {
    return categories
      .filter(category => {
        if (!category.active && !showDeletedCategories) {
          return false;
        }
        // Is search, true, if not we check if parents is current one
        return search ? true : category.parent === parent;
      })
      .map(c => {
        let result = [];
        result.push(
          <ListItem
            button
            key={c.id}
            selected={category && category.id === c.id}
            style={{
              ...(c.active ? styles.listItem : styles.listItemDeleted),
              ...{ paddingLeft: theme.spacing() * 4 * indent + 24 }
            }}
            onClick={event => {
              setCategory(c);
              history.push("/categories/" + c.id);
            }}
          >
            <ListItemText primary={c.name} secondary={c.description} />
            {c.active ? (
              <KeyboardArrowRight />
            ) : (
              <ListItemSecondaryAction>
                <IconButton onClick={() => _handleUndeleteCategory(c)}>
                  <UndoIcon />
                </IconButton>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        );
        if (!search && c.children.length > 0) {
          result.push(
            <div key={`list-indent-${indent}`}>
              {drawListItem(categories, c.id, indent + 1)}
            </div>
          );
        }

        return result;
      });
  };

  return (
    <div className="layout">
      <div className={"modalContent " + (isOpen ? "open" : "close")}>
        <Card square className="modalContentCard">
          {component}
        </Card>
      </div>
      <header className="layout_header showMobile">
        <div className="layout_header_top_bar">
          <div
            className={
              (!category ? "show " : "") + "layout_header_top_bar_title"
            }
          >
            <h2>Categories</h2>
          </div>
          <div
            className={
              (category ? "show " : "") + "layout_header_top_bar_title"
            }
            style={{ right: 80 }}
          >
            <IconButton onClick={() => history.push("/categories")}>
              <KeyboardArrowLeft style={{ color: "white" }} />
            </IconButton>
            <h2 style={{ paddingLeft: 4 }}>
              {categoryName ? categoryName : ""}
            </h2>
          </div>
          <div className="showMobile">
            <UserButton type="button" color="white" />
          </div>
        </div>
      </header>

      <div className="layout_two_columns">
        <div className={(category ? "hide " : "") + "layout_noscroll"}>
          <div className="layout_content_search wrapperMobile">
            <SearchIcon color="action" />
            <InputBase
              placeholder="Search"
              fullWidth
              value={search}
              onChange={event => setSearch(event.target.value)}
              style={{ margin: "2px 10px 0 10px" }}
            />
            <IconButton onClick={event => setMenu(event.currentTarget)}>
              <MoreVertIcon color="action" />
            </IconButton>
          </div>
          <div className="layout_content wrapperMobile">
            {categories && !categories.length ? (
              <div className="emptyContainer">
                <p>No categories</p>
              </div>
            ) : (
              ""
            )}

            {categories && categories.length && filteredCategories ? (
              <List
                className=" wrapperMobile"
                style={{ paddingBottom: 70 }}
                subheader={
                  <ListSubheader disableSticky={true}>
                    {showDeletedCategories
                      ? "Active and deleted categories"
                      : "Active categories"}
                  </ListSubheader>
                }
              >
                {drawListItem(filteredCategories)}
              </List>
            ) : (
              ""
            )}

            {!categories ? (
              <List>
                {[
                  "w120",
                  "w150",
                  "w120",
                  "w120",
                  "w120",
                  "w150",
                  "w120",
                  "w120"
                ].map((value, i) => {
                  return (
                    <ListItem button key={i} disabled={true}>
                      <ListItemText
                        primary={<span className={`loading ${value}`} />}
                        secondary={<span className="loading w50" />}
                      />
                      <KeyboardArrowRight />
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              ""
            )}
          </div>
        </div>

        {category ? (
          <div className="layout_content wrapperMobile">
            <Category
              history={history}
              category={category}
              categories={categories}
              onEditCategory={handleOpenCategory}
              onEditTransaction={handleEditTransaction}
              onDuplicationTransaction={handleDuplicateTransaction}
            />
          </div>
        ) : (
          ""
        )}
      </div>

      <Popover
        open={Boolean(menu)}
        anchorEl={menu}
        onClose={() => setMenu()}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
      >
        <List>
          <ListItem>
            <ListItemText
              primary="Show deleted categories"
              style={{ paddingRight: 40 }}
            />
            <ListItemSecondaryAction>
              <Switch
                onChange={() => {
                  setShowDeletedCategories(!showDeletedCategories);
                  setMenu();
                }}
                checked={showDeletedCategories}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Popover>

      <Fab
        color="primary"
        className={(!category ? "show " : "") + "layout_fab_button"}
        aria-label="Add"
        disabled={!categories}
        onClick={handleOpenCategory}
      >
        <ContentAdd />
      </Fab>
    </div>
  );
});

export { Categories };
