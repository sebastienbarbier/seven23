/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import TextField from "@mui/material/TextField";

import AutoCompleteSelectField from "./forms/AutoCompleteSelectField";

import { Amount } from "./currency/Amount";

import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

export default function Convertor(props) {
  const dispatch = useDispatch();

  const selectedCurrency = useSelector(state => state.account.currency);
  const lastCurrencyUsed = useSelector(state =>
    state.currencies.find(c => c.id === state.user.lastCurrencyUsed)
  );
  const [currency, setCurrency] = useState(lastCurrencyUsed);

  const rates = useSelector(state =>
    state.changes && state.changes.chain[0]
      ? state.changes.chain[0].rates
      : null
  );
  const secondDegree = useSelector(state =>
    state.changes && state.changes.chain[0]
      ? state.changes.chain[0].secondDegree
      : null
  );

  const currencies = useSelector(state =>
    state.currencies.filter(currency => {
      if (state.account && state.account.currencies) {
        return state.account.currencies.indexOf(currency.id) != -1;
      } else {
        return currency.id == state.account.currency;
      }
    })
  );

  const setValueAndConvert = value => {
    setValue(value.replace(",", "."));
  };

  const setCurrencyAndUpdate = currency => {
    setCurrency(currency);
  };

  const [value, setValue] = useState("");
  const [array, setArray] = useState(null);

  useEffect(() => {
    if (value) {
      const exchangedValues = [];
      currencies
        .filter(item => item.id != currency.id)
        .forEach(c => {
          if (rates && rates[currency.id] && rates[currency.id][c.id]) {
            exchangedValues.push({
              amount: rates[currency.id][c.id] * parseFloat(value),
              currency: c
            });
          } else if (
            secondDegree &&
            secondDegree[currency.id] &&
            secondDegree[currency.id][c.id]
          ) {
            exchangedValues.push({
              amount: secondDegree[currency.id][c.id] * parseFloat(value),
              currency: c
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
    <div className="layout">
      <header className="layout_header">
        <form className="layout_header_date_range wrapperMobile">
          <Container>
            <Stack direction='row' spacing={2} sx={{ marginTop: 2, marginBottom: 1 }}>
              <TextField
                label="Amount to convert"
                inputProps={{ lang: "en", inputMode: "decimal" }}
                onChange={event => setValueAndConvert(event.target.value)}
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
                onChange={currency => {
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
      <div className="layout_report layout_content wrapperMobile mobile_footer_padding">
        <Table>
          <TableBody>
            {array &&
              array.map(convertion => {
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
    </div>
  );
}