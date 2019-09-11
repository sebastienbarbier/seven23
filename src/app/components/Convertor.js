/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "../router";

import TextField from "@material-ui/core/TextField";

import UserButton from "./settings/UserButton";
import AutoCompleteSelectField from "./forms/AutoCompleteSelectField";

import { Amount } from "./currency/Amount";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

export default function Convertor(props) {
  const dispatch = useDispatch();
  const { history } = useRouter();

  const lastCurrencyUsed = useSelector(state =>
    state.currencies.find(c => c.id === state.user.lastCurrencyUsed)
  );
  const [currency, setCurrency] = useState(lastCurrencyUsed);

  const rates = useSelector(state =>
    state.changes.chain[0] ? state.changes.chain[0].rates : null
  );
  const secondDegree = useSelector(state =>
    state.changes.chain[0] ? state.changes.chain[0].secondDegree : null
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
    setValue(value);
  };

  const setCurrencyAndUpdate = currency => {
    setCurrency(currency);
  };

  const [value, setValue] = useState("");
  const [error, setError] = useState({});

  const [array, setArray] = useState(null);

  useEffect(() => {
    if (value) {
      const exchangedValues = [];
      currencies
        .filter(item => item.id != currency.id)
        .forEach(c => {
          if (rates[currency.id][c.id]) {
            exchangedValues.push({
              amount: rates[currency.id][c.id] * parseFloat(value),
              currency: c
            });
          } else if (secondDegree[currency.id][c.id]) {
            exchangedValues.push({
              amount: secondDegree[currency.id][c.id] * parseFloat(value),
              currency: c
            });
          }
        });
      exchangedValues.sort((a, b) => a.currency.name > a.currency.b);
      setArray(exchangedValues);
    } else {
      setArray(null);
    }
  }, [value, currency]);

  return (
    <div className="layout">
      <header className="layout_header">
        <div className="layout_header_top_bar showMobile">
          <h2>Convertor</h2>
          <div>
            <UserButton type="button" color="white" />
          </div>
        </div>
        <form className="layout_header_date_range wrapperMobile">
          <TextField
            label="Amount to convert"
            inputProps={{ lang: "en", inputMode: "decimal" }}
            error={Boolean(error.text)}
            helperText={error.text}
            onChange={event => setValueAndConvert(event.target.value)}
            value={value}
            fullWidth
            autoFocus={true}
            margin="normal"
          />
          <AutoCompleteSelectField
            label="Currency"
            value={currency}
            values={currencies || []}
            error={Boolean(error.local_currency)}
            helperText={error.local_currency}
            onChange={currency => setCurrencyAndUpdate(currency)}
            maxHeight={400}
            margin="normal"
          />
        </form>
      </header>
      <div className="layout_report layout_content wrapperMobile">
        <Table>
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
        </Table>
      </div>
    </div>
  );
}
