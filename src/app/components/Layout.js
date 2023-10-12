/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, Route, Navigate, Routes, RouterProvider, Outlet } from "react-router-dom";

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

// Component for router
import Navigation from "./Navigation";
import Dashboard from "./Dashboard";
import Transactions from "./Transactions";
import Report from "./Report";
import Changes from "./Changes";
import Categories from "./Categories";
import CategoriesSuggestions from './categories/CategoriesSuggestions';
import Settings from "./Settings";
import Reset from "./Reset";
import ResetPassword from "./ResetPassword";
import Search from "./Search";
import Convertor from "./Convertor";
import Nomadlist from "./Nomadlist";
import NotFound from "./NotFound";

// Get started section
import GetStarted from "./welcoming/GetStarted";
import SelectAccountType from "./welcoming/SelectAccountType";
import CreateAccount from "./welcoming/CreateAccount";
import ImportAccount from "./welcoming/ImportAccount";
import LoginForm from "./welcoming/LoginForm";
import ServerForm from "./login/ServerForm";
import ForgottenPasswordForm from "./login/ForgottenPasswordForm";

import AccountsSettings from "./settings/AccountsSettings";
import ProfileSettings from "./settings/ProfileSettings";
import HelpSettings from "./settings/HelpSettings";
import ServerSettings from "./settings/ServerSettings";
import AppSettings from "./settings/AppSettings";
import DevelopmentSettings from "./settings/DevelopmentSettings";
import SecuritySettings from "./settings/SecuritySettings";
import CurrenciesSettings from "./settings/CurrenciesSettings";
import ImportExportSettings from "./settings/ImportExportSettings";
import ThemeSettings from "./settings/ThemeSettings";
import SubscriptionSettings from "./settings/SubscriptionSettings";
import SocialNetworksSettings from "./settings/SocialNetworksSettings";
import SignInSignUp from "./settings/SignInSignUp";
import ForceBugReport from "./errors/ForceBugReport";

import SyncButton from "./accounts/SyncButton";
import AccountSelector from "./accounts/AccountSelector";
import CurrencySelector from "./currency/CurrencySelector";
import UserButton from "./settings/UserButton";
import SnackbarsManager from "./snackbars/SnackbarsManager";

import "./Layout.scss";

export default function Layout(props) {
  const dispatch = useDispatch();
  const location = useLocation();

  const path = useSelector((state) => state.app.url);

  // hasAccount is used to define some basic behaviour if user need to create an account
  // Current selected account to show/hide some elements if account.isLocal
  const account = useSelector((state) => state.account);
  const hasAccount = useSelector(
    (state) => (state.accounts.remote.length + state.accounts.local.length) >= 1
  );
  const hasMoreThanOneAccount = useSelector(
    (state) => (state.accounts.remote.length + state.accounts.local.length) > 1
  );
  // Disable some UI element if app is syncing
  const isSyncing = useSelector(
    (state) => state.state.isSyncing || state.state.isLoading
  );

  // year
  const year = new Date().getFullYear();
  // month
  const month = new Date().getMonth() + 1;

  //
  // Modal logic
  //
  const [modalComponent, setModalComponent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = (component) => {
    if (component) {
      setModalComponent(component);
      setIsModalOpen(true);
    } else {
      setTimeout(() => {
        setModalComponent(null);
      }, 200);
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
     toggleModal();
    }
  }, [location]);

  const isDeveloper = useSelector(state => state.app.isDeveloper);

  return (
    <div id="appContainer">
      <div id="safeAreaInsetTop"></div>
      { !hasAccount && <SnackbarsManager />}
      { !hasAccount ? (
        <div
          id="container"
          style={{
            flexDirection: 'column'
          }}
        >
          <Routes>
            <Route path="/" element={<Outlet />}>
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
          </Routes>
        </div>
        ) : (
        <div id="container">
          <aside className="navigation">
            <Navigation />
          </aside>

          <div id="content">
            <Stack id="toolbar" className="hideMobile" direction="row" spacing={0.5}>
              {hasAccount && (<>
                {!account.isLocal && (<>
                  <SyncButton className="showDesktop" />
                  <Divider className="showDesktop"></Divider>
                </>)}
                  { hasMoreThanOneAccount && (<AccountSelector
                    disabled={isSyncing}
                    className="showDesktop"
                  />) }
                  <CurrencySelector
                    disabled={isSyncing}
                    display="code"
                    className="showDesktop"
                    onModal={toggleModal}
                  />
              </>)}
              <Divider orientation="vertical" className="showDesktop"/>
              <UserButton onModal={toggleModal} />
            </Stack>
            <main style={{ position: "relative", flexGrow: 1 }}>

              <div className={"modalContent " + (isModalOpen ? "open" : "")}>
                <Card square className="modalContentCard">
                  { modalComponent }
                </Card>
              </div>

              <Routes>
                <Route path="/" element={<Outlet />}>
                  <Route path="login" element={<Navigate replace to={`/dashboard`} />} />
                  <Route path="dashboard" element={<Dashboard onModal={toggleModal} />} />
                  <Route path="report" element={<Report onModal={toggleModal} />} />
                  <Route path="transactions" element={<Navigate replace to={`/transactions/${year}/${month}`} />} />
                    <Route
                      path="/transactions/:year/:month"
                      element={<Transactions onModal={toggleModal} />}
                    />
                    <Route
                      path="/transactions/:year/:month/:day"
                      element={<Transactions onModal={toggleModal} />}
                    />
                  <Route path="categories" element={<Categories onModal={toggleModal} />}>
                    <Route path="suggestions" element={<CategoriesSuggestions />} />
                    <Route path=":id" element={<Categories onModal={toggleModal} />} />
                  </Route>
                  <Route path="changes" element={<Changes onModal={toggleModal} />}>
                    <Route path=":id" element={<Changes onModal={toggleModal} />} />
                  </Route>
                  <Route path="search" element={<Search onModal={toggleModal} />} />
                  <Route path="convertor" element={<Convertor onModal={toggleModal} />} />
                  <Route path="nomadlist" element={<Nomadlist onModal={toggleModal} />}>
                    <Route path="trip/:id" element={<Nomadlist />} />
                    <Route path="city/:slug" element={<Nomadlist />} />
                    <Route path="country/:slug" element={<Nomadlist />} />
                  </Route>
                  <Route path="settings" element={<Settings onModal={toggleModal} />}>
                    <Route path="profile" element={<ProfileSettings onModal={toggleModal} />}/>
                    <Route path="accounts" element={<AccountsSettings onModal={toggleModal} />}/>
                    <Route path="currencies" element={<CurrenciesSettings />} />
                    <Route path="login" element={<SignInSignUp onModal={toggleModal} />} />
                    <Route path="server" element={<ServerSettings />} />
                    <Route path="security" element={<SecuritySettings onModal={toggleModal}  />} />
                    <Route path="subscription" element={<SubscriptionSettings />} />
                    <Route path="import/export/" element={<ImportExportSettings />} />
                    <Route path="social" element={<SocialNetworksSettings onModal={toggleModal} />}/>
                    <Route path="theme" element={<ThemeSettings />} />
                    <Route path="application" element={<AppSettings />} />
                    { isDeveloper && <Route path="development" element={<DevelopmentSettings />} /> }
                    <Route path="help" element={<HelpSettings />} />
                  </Route>
                  <Route path="reset" element={<Reset />} />
                  <Route path="crash" element={<ForceBugReport />} />
                  <Route path="*" element={<NotFound />} />
                  <Route index element={<Navigate replace to="dashboard" />} />
                </Route>
              </Routes>
            <SnackbarsManager />
            </main>
          </div>
        </div>
      )}
    </div>
  );
}