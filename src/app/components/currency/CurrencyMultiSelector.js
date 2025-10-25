/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useTheme } from "@mui/material/styles";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";

import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import Box from "@mui/material/Box";

import CancelIcon from "@mui/icons-material/Cancel";

function NoOptionsMessage(props) {
  const theme = useTheme();
  return (
    <Typography
      color="textSecondary"
      sx={{
        padding: theme.spacing(1, 2),
      }}
      {...props.innerProps}
    >
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
  const theme = useTheme();
  return (
    <Paper
      square
      sx={{
        position: "absolute",
        zIndex: 1,
        marginTop: theme.spacing(0),
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
  const theme = useTheme();
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      sx={{
        margin: theme.spacing(0.5, 0.25),
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

export default function CurrencyMultiSelector(props) {
  const theme = useTheme();

  const currencies = useSelector((state) =>
    state.currencies.map((currency) => {
      return {
        value: currency.id,
        label: `${currency.code} - ${currency.name}`,
      };
    })
  );

  const [multi, setMulti] = React.useState(null);

  useEffect(() => {
    setMulti(
      currencies.filter(
        (currency) => (props.value || []).indexOf(currency.value) != -1
      ) || null
    );
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
          label: "Favorites Currencies",
          InputLabelProps: {
            htmlFor: "react-select-multiple",
            shrink: true,
          },
          placeholder: "Select multiple countries",
        }}
        options={currencies}
        components={components}
        value={multi}
        onChange={handleChangeMulti}
        isMulti
      />
    </div>
  );
}
