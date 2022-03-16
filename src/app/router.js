import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const RouterContext = React.createContext(null);

export const HookedBrowserRouter = ({ children, history }) => (
  <BrowserRouter>
    <Routes>
      <Route>
        {routeProps => (
          <RouterContext.Provider value={routeProps}>
            {children}
          </RouterContext.Provider>
        )}
      </Route>
    </Routes>
  </BrowserRouter>
);

export function useRouter() {
  return React.useContext(RouterContext);
}