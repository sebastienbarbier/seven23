/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, Link, useParams, useNavigate, useLocation} from "react-router-dom";


import Card from "@mui/material/Card";

import { useTheme } from "../theme";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";

import InputBase from "@mui/material/InputBase";
import Popover from "@mui/material/Popover";
import Divider from "@mui/material/Divider";

import Box from "@mui/material/Box";

import Switch from "@mui/material/Switch";

import Slide from "@mui/material/Slide";
import Button from "@mui/material/Button";

import IconButton from "@mui/material/IconButton";

import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";

import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import UndoIcon from "@mui/icons-material/Undo";
import ContentAdd from "@mui/icons-material/Add";
//
import AppActions from "../actions/AppActions";
import CategoryActions from "../actions/CategoryActions";
import { Category } from "./categories/Category";

import CategoryForm from "./categories/CategoryForm";

import { fuzzyFilter } from "./search/utils";

import { red } from '@mui/material/colors';

import useRouteTitle from "../hooks/useRouteTitle";

import LayoutSideListPanel from "./layout/LayoutSideListPanel";

import './Categories.scss';

const styles = {
  button: {
    float: "right",
    marginTop: "26px",
  },
  listItem: {
    paddingLeft: "14px",
  },
  listItemDeleted: {
    paddingLeft: "14px",
    color: red[500],
  },
};

export default function Categories(props) {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();

  const theme = useTheme();

  const location = useLocation();
  const titleObject = useRouteTitle();

  let isSuggestionsVisible = location.pathname.startsWith("/categories/suggestions");

  const categories = useSelector((state) =>
    state.categories ? state.categories.list : null
  );
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [category, setCategory] = useState(() =>
    categories ? categories.find((c) => c.id == params.id) : null
  );
  const [categoryName, setCategoryName] = useState(
    category ? category.name : ""
  );

  const [menu, setMenu] = useState(null);
  const [search, setSearch] = useState("");

  const [showDeletedCategories, setShowDeletedCategories] = useState(false);

  useEffect(() => {
    if (!params.id) {
      setCategory(null);
      dispatch(AppActions.setFloatingAddButton(() => handleOpenCategory(), !!categories));
    } else {
      setCategoryName(category ? category.name : "");
    }
  }, [params.id]);

  useEffect(() => {
    if (category) {
      dispatch(AppActions.setNavBar(`${category.name}`, titleObject.back));
    }
  }, [location]);

  useEffect(() => {
    if (search) {
      setFilteredCategories(
        categories
          ? categories.filter((category) => {
              return fuzzyFilter(search || "", category.name);
            })
          : null
      );
    } else {
      setFilteredCategories(categories);
    }
    dispatch(AppActions.setFloatingAddButton(() => handleOpenCategory(), !!categories));
  }, [search, categories]);

  // Update category
  useEffect(() => {
    if (category && categories) {
      setCategory(categories.find((c) => c.id === category.id));
    }
  }, [categories]);

  const handleOpenCategory = (category = {}) => {
    dispatch(AppActions.openModal(<CategoryForm
        category={category}
        onSubmit={() => dispatch(AppActions.closeModal())}
        onClose={() => dispatch(AppActions.closeModal())}
      />));
  };

  const _handleUndeleteCategory = (category) => {
    category.active = true;
    dispatch(CategoryActions.update(category));
  };

  const drawListItem = (categories, parent = null, indent = 0, show_no_categories = false) => {
    const result = categories
      .filter((category) => {
        if (!category.active && !showDeletedCategories) {
          return false;
        }
        // Is search, true, if not we check if parents is current one
        return search ? true : category.parent === parent;
      })
      .map((c) => {
        let result = [];
        result.push(
          <ListItem
            button
            key={c.id}
            selected={category && category.id === c.id}
            style={{
              ...(c.active ? styles.listItem : styles.listItemDeleted),
              ...{ paddingLeft: 8 * 4 * indent + 24 },
            }}
            onClick={(event) => {
              setCategory(c);
              navigate("/categories/" + c.id);
            }}
          >
            <ListItemText primary={c.name} secondary={c.description} />
            {c.active ? (
              <KeyboardArrowRight />
            ) : (
              <ListItemSecondaryAction>
                <IconButton onClick={() => _handleUndeleteCategory(c)} size="large">
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

      if (show_no_categories) {
        result.push(<Divider />)
        result.push(
          <ListItem
            button
            key={'null'}
            selected={category && category.id === 'null'}
            style={{
              ...(styles.listItem),
              ...{ paddingLeft: 8 * 4 * indent + 24 },
              ...{ fontStyle: 'italic'},
            }}
            onClick={(event) => {
              setCategory({ id: 'null', name: 'Without a category' });
              navigate("/categories/null");
            }}
          >
            <ListItemText primary={'Without a category'} secondary={''} />
            <KeyboardArrowRight />
          </ListItem>
        );
        result.push(
          <Box className="emptyContainer" sx={{ paddingTop: 1, paddingBottom: 0}}>
            <Link to="/categories/suggestions">Need suggestions ?</Link>
          </Box>
        );
      }

      return result;
  };

  return (
    <LayoutSideListPanel className="categoriesView"
      sidePanel={
      <>
        <div className="wrapperMobile">
          {categories && !categories.length &&
            <div className="emptyContainer">
              <p>No categories </p>
              <Link to="/categories/suggestions">Need suggestions ?</Link>
            </div>
          }
          {!!categories && !!categories.length && filteredCategories &&
            <List
              className=" wrapperMobile"
              id="cy_categories_list"
              subheader={
                <ListSubheader disableSticky={true}>
                  {showDeletedCategories
                    ? "Active and deleted categories"
                    : "Active categories"}
                </ListSubheader>
              }
            >
              {drawListItem(filteredCategories, null, 0, true)}
            </List>
          }

          {!categories &&
            <List>
              {[
                "w120",
                "w150",
                "w120",
                "w120",
                "w120",
                "w150",
                "w120",
                "w120",
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
          }
        </div>
      </>}>

      <Box className="searchBox">
        <SearchIcon color="action" />
        <InputBase
          placeholder="Search"
          fullWidth
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ margin: "14px 10px 14px 10px" }}
        />
        <IconButton onClick={(event) => setMenu(event.currentTarget)} size="large">
          <MoreVertIcon color="action" />
        </IconButton>
      </Box>

      <Popover
        open={Boolean(menu)}
        anchorEl={menu}
        onClose={() => setMenu()}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <List>
          <ListItem
            button
            onClick={() => {
              setShowDeletedCategories(!showDeletedCategories);
              setMenu();
            }}
          >
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
    </LayoutSideListPanel>
  );
}