import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import Stack from "@mui/material/Stack";

export default function CategoriesSuggestions(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <>
      <Stack direction="column" sx={{ paddingTop: 2, marginLeft: 2, marginRight: 2  }}>
        <h1 className="hideMobile" style={{ width: "100%" }}>
          Suggestions
        </h1>

        <div style={{ paddingBottom: 20, margin: "8px 20px" }}>
          <ul>
            <li>Food</li>
              <ul>
                <li>Food at home</li>
                <ul>
                  <li>Cereals and bakery products</li>
                  <li>Meats, poultry, fish, and eggs</li>
                  <li>Dairy products</li>
                  <li>Fruits and vegetables</li>
                  <li>Other food at home</li>
                </ul>
                <li>Food away from home</li>
              </ul>
            <li>Alcoholic beverages</li>
            <li>Housing</li>
              <ul>
                <li>Shelter</li>
                <ul>
                  <li>Owned dwellings</li>
                  <li>Rented dwellings</li>
                  <li>Other lodging</li>
                </ul>
                <li>Utilities, fuels, and public services</li>
                <li>Household operations</li>
                <li>Housekeeping supplies</li>
                <li>Household furnishings and equipment</li>
              </ul>
            <li>Apparel and services</li>
            <li>Transportation</li>
            <ul>
              <li>Vehicle purchases (net outlay)</li>
              <li>Gasoline, other fuels, and motor oil</li>
              <li>Other vehicle expenses</li>
              <li>Public and other transportation</li>
            </ul>
            <li>Healthcare</li>
            <li>Entertainment</li>
            <li>Personal care products and services</li>
            <li>Reading</li>
            <li>Education</li>
            <li>Tobacco products and smoking supplies</li>
            <li>Miscellaneous</li>
            <li>Cash contributions</li>
            <li>Personal insurance and pensions</li>
            <ul>
              <li>Life and other personal insurance</li>
              <li>Pensions and Social Security</li>
            </ul>
          </ul>
          <p>Source: <a href="https://www.bls.gov/opub/reports/consumer-expenditures/2020/home.htm" target="_blank">U.S. Bureau of Labor Statistics [en]</a></p>

          <p>Alternative options: <a href="https://www.insee.fr/fr/statistiques/2385823">Insee [fr]</a></p>
        </div>
      </Stack>
    </>
  );
}