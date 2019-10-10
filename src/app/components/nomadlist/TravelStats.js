import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import StatisticsActions from "../../actions/StatisticsActions";

export default function TravelStats() {
  const dispatch = useDispatch();

  const [statistics, setStatistic] = useState(null);

  const nomadlist = useSelector(state =>
    state.user.socialNetworks ? state.user.socialNetworks.nomadlist || {} : {}
  );

  const performSearch = () => {
    if (nomadlist) {
      setStatistic(null);
      dispatch(StatisticsActions.nomadlist()).then(result => {
        result.cities.sort((a, b) => {
          if (a.trips.length < b.trips.length) {
            return 1;
          } else {
            return -1;
          }
        });
        setStatistic(result.cities);
      });
    }
  };

  useEffect(() => {
    performSearch();
  }, [nomadlist]);

  return (
    <div style={{ padding: "2px 20px" }}>
      <h2>{nomadlist.data.username}</h2>

      {statistics ? (
        <div>
          <h3>Trips</h3>
          {statistics.map((city, i) => {
            return (
              <p key={i}>
                {city.place}, {city.trips.length} trips, {city.stay} days,{" "}
                {city.transactions_length} transactions
              </p>
            );
          })}
        </div>
      ) : (
        <span className="loading W200"></span>
      )}
    </div>
  );
}
