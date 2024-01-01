/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useTheme } from "@mui/material/styles";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import CancelIcon from "@mui/icons-material/Cancel";

const ITEM_HEIGHT = 48;

function NoOptionsMessage(props) {
  return (
    <Typography color="textSecondary" sx={{ padding: 2 }} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}
function Control(props) {
  const {
    children,
    innerProps,
    innerRef,
    selectProps: { TextFieldProps },
  } = props;

  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          sx: {
            display: "flex",
            padding: 0.5,
            height: "auto",
          },
          ref: innerRef,
          children,
          ...innerProps,
        },
      }}
      {...TextFieldProps}
    />
  );
}
function Menu(props) {
  return (
    <Paper
      square
      sx={{
        position: "absolute",
        zIndex: 1,
        marginTop: 1,
        left: 0,
        right: 0,
      }}
      {...props.innerProps}
    >
      {props.children}
    </Paper>
  );
}
function MultiValue(props) {
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      sx={{
        margin: 0.5,
      }}
      onDelete={props.removeProps.onClick}
      deleteIcon={<CancelIcon {...props.removeProps} />}
    />
  );
}
function Option(props) {
  return (
    <MenuItem
      ref={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}
function Placeholder(props) {
  return (
    <Typography
      color="textSecondary"
      sx={{
        position: "absolute",
        left: 2,
        bottom: 6,
        fontSize: 16,
      }}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function SingleValue(props) {
  return (
    <Typography
      sx={{
        fontSize: 16,
      }}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}
function ValueContainer(props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        flex: 1,
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {props.children}
    </Box>
  );
}

const components = {
  Control,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
};

export default function CategoriesMultiSelector(props) {
  const theme = useTheme();
  const dispatch = useDispatch();

  const categories = useSelector((state) => {
    if (state.categories && state.categories.list) {
      return state.categories.list.map((category) => {
        return {
          value: category.id,
          label: `${category.name}`,
        };
      });
    } else {
      return null;
    }
  });

  const [multi, setMulti] = React.useState(null);

  useEffect(() => {
    if (categories) {
      setMulti(
        categories.filter(
          (category) => (props.value || []).indexOf(category.value) != -1
        ) || null
      );
    }
  }, [props.value]);

  function handleChangeMulti(value) {
    setMulti(value);
    if (props.onChange) {
      props.onChange(value);
    }
  }

  const selectStyles = {
    input: (base) => ({
      ...base,
      color: theme.palette.text.primary,
      "& input": {
        font: "inherit",
      },
    }),
  };

  return (
    <div className={props.className}>
      <Select
        styles={selectStyles}
        inputId="react-select-multiple"
        TextFieldProps={{
          label: "Categories to ignore",
          InputLabelProps: {
            htmlFor: "react-select-multiple",
            shrink: true,
          },
          placeholder: "Select multiple categories",
        }}
        options={categories}
        components={components}
        value={multi}
        onChange={handleChangeMulti}
        isMulti
      />
    </div>
  );
}
