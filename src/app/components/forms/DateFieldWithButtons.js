import moment from "moment";
import { useState } from "react";

import InsertInvitationIcon from "@mui/icons-material/InsertInvitation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { DatePicker } from "@mui/x-date-pickers";

import Stack from "@mui/material/Stack";

const styles = {
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  datefield: {
    flexGrow: 1,
    width: "100%",
    marginTop: "10px",
  },
  button: {
    minWidth: "120px",
    marginTop: "20px",
    marginLeft: "12px",
  },
};

export default function DateFieldWithButtons({
  label,
  value,
  error,
  format,
  helperText,
  disabled,
  onChange,
  id,
  disableYestedayButton,
}) {
  let [isOpen, setIsOpen] = useState(false);
  return (
    <Box sx={styles.container} className="dateFieldWithButtons">
      <DatePicker
        label={label}
        value={value ? moment(value) : ""}
        onChange={(newValue) => {
          onChange(moment(newValue));
        }}
        disabled={disabled}
        sx={styles.datefield}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        format={format ? format : "DD/MM/YYYY"}
        slotProps={{
          textField: {
            id: id,
            helperText: helperText,
            margin: "normal",
            sx: styles.datefield,
            InputProps: {
              endAdornment: (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Button
                    aria-label="delete"
                    color="inherit"
                    sx={{ minWidth: "auto" }}
                    onClick={(event) => {
                      setIsOpen(!isOpen);
                    }}
                  >
                    <InsertInvitationIcon sx={{ opacity: 0.54 }} />
                  </Button>
                  {!disableYestedayButton && (
                    <Button
                      disabled={disabled}
                      color="inherit"
                      onClick={(event) => {
                        event.stopPropagation();
                        onChange(moment().subtract(1, "days"));
                        setIsOpen(false);
                      }}
                    >
                      Yesterday
                    </Button>
                  )}
                </Stack>
              ),
            },
          },
        }}
      />
    </Box>
  );
}
