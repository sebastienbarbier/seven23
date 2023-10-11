import React from "react";
import {
  createBrowserRouter,
  Navigate
} from "react-router-dom";

// Get started section
import Layout from "./components/Layout";
import GetStarted from "./components/welcoming/GetStarted";
import SelectAccountType from "./components/welcoming/SelectAccountType";
import CreateAccount from "./components/welcoming/CreateAccount";
import ImportAccount from "./components/welcoming/ImportAccount";
import LoginForm from "./components/welcoming/LoginForm";
import ServerForm from "./components/login/ServerForm";
import ForgottenPasswordForm from "./components/login/ForgottenPasswordForm";
import ResetPassword from "./components/ResetPassword";

/*
<Route path="/" element={<Layout />}>
  <Route path="" element={<GetStarted />} />
  <Route path="select-account-type" element={<SelectAccountType />} />
  <Route path="create-account" element={<CreateAccount />} />
  <Route path="import-account" element={<ImportAccount />} />
  <Route path="login" element={<LoginForm />} />
  <Route path="server" element={<ServerForm />} />
  <Route path="password/reset" element={<ForgottenPasswordForm />} />
  <Route path="resetpassword" element={<ResetPassword />} />
  <Route path="*" element={<Navigate replace to={`/`} />} />
</Route>
*/

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <GetStarted />,
      },
      {
        path: 'select-account-type',
        element: <SelectAccountType />,
      },
      {
        path: 'create-account',
        element: <CreateAccount />,
      },
      {
        path: 'import-account',
        element: <ImportAccount />,
      },
      {
        path: 'login',
        element: <LoginForm />,
      },
      {
        path: 'server',
        element: <ServerForm />,
      },
      {
        path: 'password/reset',
        element: <ForgottenPasswordForm />,
      },
      {
        path: 'resetpassword',
        element: <ResetPassword />,
      },
      {
        path: '*',
        element: <Navigate replace to={`/`} />,
      },
    ],
  }
];

export default createBrowserRouter(routes);