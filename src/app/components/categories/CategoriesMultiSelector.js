/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useTheme } from "@mui/material/styles";
import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import CancelIcon from "@mui/icons-material/Cancel";

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

  const { slotProps: textFieldSlotProps, ...restTextFieldProps } =
    TextFieldProps || {};

  return (
    <TextField
      fullWidth
      slotProps={{
        ...textFieldSlotProps,
        input: {
          ...textFieldSlotProps?.input,
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
        },
      }}
      {...restTextFieldProps}
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
    <Box
      ref={props.innerRef}
      component="div"
      sx={{
        fontWeight: props.isSelected ? 500 : 400,
        backgroundColor: props.isFocused ? "action.hover" : "transparent",
        cursor: "pointer",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        minHeight: 48,
        boxSizing: "border-box",
        px: 2,
        py: 0.75,
      }}
      {...props.innerProps}
    >
      {props.children}
    </Box>
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

  const categoriesList = useSelector((state) => state.categories?.list);
  const categories = useMemo(() => {
    if (!categoriesList) {
      return null;
    }
    return categoriesList.map((category) => ({
      value: category.id,
      label: `${category.name}`,
    }));
  }, [categoriesList]);

  const [multi, setMulti] = React.useState(null);

  useEffect(() => {
    if (categories) {
      setMulti(
        categories.filter(
          (category) => (props.value || []).indexOf(category.value) != -1
        ) || null
      );
    }
  }, [props.value, categories]);

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
          placeholder: "Select multiple categories",
          slotProps: {
            inputLabel: {
              htmlFor: "react-select-multiple",
              shrink: true,
            },
          },
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
