/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

import AutoCompleteSelectField from "./forms/AutoCompleteSelectField";

import { Amount } from "./currency/Amount";

import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import LayoutFullWidth from "./layout/LayoutFullWidth";

import "./Convertor.scss";

export default function Convertor(props) {
  const dispatch = useDispatch();

  const selectedCurrency = useSelector((state) => state.account.currency);
  const lastCurrencyUsed = useSelector((state) =>
    state.currencies.find((c) => c.id === state.user.lastCurrencyUsed)
  );
  const [currency, setCurrency] = useState(lastCurrencyUsed);

  const rates = useSelector((state) =>
    state.changes && state.changes.chain[0]
      ? state.changes.chain[0].rates
      : null
  );
  const secondDegree = useSelector((state) =>
    state.changes && state.changes.chain[0]
      ? state.changes.chain[0].secondDegree
      : null
  );

  const currencies = useSelector((state) =>
    state.currencies.filter((currency) => {
      if (state.account && state.account.currencies) {
        return state.account.currencies.indexOf(currency.id) != -1;
      } else {
        return currency.id == state.account.currency;
      }
    })
  );

  const setValueAndConvert = (value) => {
    setValue(value.replace(",", "."));
  };

  const setCurrencyAndUpdate = (currency) => {
    setCurrency(currency);
  };

  const [value, setValue] = useState("");
  const [array, setArray] = useState(null);

  useEffect(() => {
    if (value) {
      const exchangedValues = [];
      currencies
        .filter((item) => item.id != currency.id)
        .forEach((c) => {
          if (rates && rates[currency.id] && rates[currency.id][c.id]) {
            exchangedValues.push({
              amount: rates[currency.id][c.id] * parseFloat(value),
              currency: c,
            });
          } else if (
            secondDegree &&
            secondDegree[currency.id] &&
            secondDegree[currency.id][c.id]
          ) {
            exchangedValues.push({
              amount: secondDegree[currency.id][c.id] * parseFloat(value),
              currency: c,
            });
          }
        });
      exchangedValues.sort((a, b) =>
        a.currency.name > b.currency.name ? 1 : -1
      );
      setArray(exchangedValues);
    } else {
      setArray(null);
    }
  }, [value, currency]);

  return (
    <LayoutFullWidth>
      <Box className="convertor">
        <header>
          <form>
            <Container>
              <Stack
                direction="row"
                spacing={2}
                sx={{ marginTop: 0.5, marginBottom: 0 }}
              >
                <TextField
                  label="Amount to convert"
                  inputProps={{ lang: "en", inputMode: "decimal" }}
                  onChange={(event) => setValueAndConvert(event.target.value)}
                  value={value}
                  disabled={!selectedCurrency}
                  fullWidth
                  autoFocus={true}
                  margin="normal"
                />
                <AutoCompleteSelectField
                  label="Currency"
                  value={currency}
                  values={currencies || []}
                  disabled={!selectedCurrency || !currencies}
                  onChange={(currency) => {
                    if (currency) {
                      setCurrencyAndUpdate(currency);
                    }
                  }}
                  maxHeight={400}
                  margin="normal"
                />
              </Stack>
            </Container>
          </form>
        </header>

        {array && (
          <div className="content">
            <Table>
              <TableBody>
                {array &&
                  array.map((convertion) => {
                    return (
                      <TableRow key={convertion.currency.id}>
                        <TableCell align="right" style={{ width: "50%" }}>
                          <Amount
                            value={convertion.amount}
                            currency={convertion.currency}
                          />
                        </TableCell>
                        <TableCell style={{ width: "50%" }}>
                          {convertion.currency.name}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        )}
      </Box>
    </LayoutFullWidth>
  );
}
