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

// Main categories
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import Report from "./components/Report";
import Changes from "./components/Changes";
import Categories from "./components/Categories";
import CategoriesSuggestions from './components/categories/CategoriesSuggestions';
import Settings from "./components/Settings";
import Reset from "./components/Reset";
import Search from "./components/Search";
import Convertor from "./components/Convertor";
import Nomadlist from "./components/Nomadlist";
import NotFound from "./components/NotFound";

import AccountsSettings from "./components/settings/AccountsSettings";
import ProfileSettings from "./components/settings/ProfileSettings";
import HelpSettings from "./components/settings/HelpSettings";
import ServerSettings from "./components/settings/ServerSettings";
import AppSettings from "./components/settings/AppSettings";
import DevelopmentSettings from "./components/settings/DevelopmentSettings";
import SecuritySettings from "./components/settings/SecuritySettings";
import ImportExportSettings from "./components/settings/ImportExportSettings";
import ThemeSettings from "./components/settings/ThemeSettings";
import SubscriptionSettings from "./components/settings/SubscriptionSettings";
import SocialNetworksSettings from "./components/settings/SocialNetworksSettings";
import SignInSignUp from "./components/settings/SignInSignUp";
import ForceBugReport from "./components/errors/ForceBugReport";

import GuardHasAccount from './components/guards/GuardHasAccount';
import GuardHasNoAccount from './components/guards/GuardHasNoAccount';
import GuardHasNomadList from './components/guards/GuardHasNomadList';
import GuardIsDeveloper from './components/guards/GuardIsDeveloper';

// year
const year = new Date().getFullYear();
// month
const month = new Date().getMonth() + 1;

const routes = [
  {
    element: <Layout />,
    title: 'Root',
    children: [
      {
        path: '/',
        title: 'Get Started',
        element: <GuardHasNoAccount><GetStarted /></GuardHasNoAccount>,
      },
      {
        path: 'select-account-type',
        title: 'Welcome back',
        element: <GuardHasNoAccount><SelectAccountType /></GuardHasNoAccount>,
      },
      {
        path: 'create-account',
        title: 'Create Account',
        element: <GuardHasNoAccount><CreateAccount /></GuardHasNoAccount>,
      },
      {
        path: 'import-account',
        title: 'Import a .json file',
        element: <GuardHasNoAccount><ImportAccount /></GuardHasNoAccount>,
      },
      {
        path: 'login',
        title: 'Log in',
        element: <GuardHasNoAccount><LoginForm /></GuardHasNoAccount>,
      },
      {
        path: 'server',
        title: 'Select a server',
        element: <GuardHasNoAccount><ServerForm /></GuardHasNoAccount>,
      },
      {
        path: 'password/reset',
        title: 'Forgotten password',
        element: <GuardHasNoAccount><ForgottenPasswordForm /></GuardHasNoAccount>,
      },
      {
        path: 'resetpassword',
        title: 'Forgotten password',
        element: <ResetPassword />,
      },
      // HAS ACCOUNT
      {
        path: 'dashboard',
        title: 'Dashboard',
        element: <GuardHasAccount><Dashboard /></GuardHasAccount>,
      },
      {
        path: 'report',
        title: 'Report',
        element: <GuardHasAccount><Report /></GuardHasAccount>,
      },
      {
        path: 'transactions',
        title: 'Transactions',
        element: <GuardHasAccount><Navigate replace to={`/transactions/${year}/${month}`} /></GuardHasAccount>,
      },
      {
        path: 'transactions/:year/:month',
        title: 'Transactions',
        element: <GuardHasAccount><Transactions /></GuardHasAccount>,
      },
      {
        path: 'transactions/:year/:month/:day',
        title: 'Transactions',
        element: <GuardHasAccount><Transactions /></GuardHasAccount>,
      },
      {
        path: 'categories',
        title: 'Categories',
        element: <GuardHasAccount><Categories /></GuardHasAccount>,
        children: [
          {
            path: 'suggestions',
            title: 'Suggestions',
            element: <CategoriesSuggestions />
          },
          {
            path: ':id',
            title: 'category',
            element: <GuardHasAccount><Categories /></GuardHasAccount>
          },
        ]
      },
      {
        path: 'changes',
        title: 'Changes',
        element: <GuardHasAccount><Changes /></GuardHasAccount>,
        children: [
          {
            path: ':id',
            title: 'change',
            element: <GuardHasAccount><Changes /></GuardHasAccount>
          },
        ]
      },
      {
        path: 'search',
        title: 'Search',
        element: <GuardHasAccount><Search /></GuardHasAccount>,
      },
      {
        path: 'convertor',
        title: 'Convertor',
        element: <GuardHasAccount><Convertor /></GuardHasAccount>,
      },
      {
        path: 'nomadlist',
        title: 'Nomadlist',
        element: <GuardHasAccount><GuardHasNomadList><Nomadlist/></GuardHasNomadList></GuardHasAccount>,
        children: [
          {
            path: 'trip/:id',
            element: <GuardHasAccount><GuardHasNomadList><Nomadlist /></GuardHasNomadList></GuardHasAccount>
          },
          {
            path: 'city/:slug',
            element: <GuardHasAccount><GuardHasNomadList><Nomadlist /></GuardHasNomadList></GuardHasAccount>
          },
          {
            path: 'country/:slug',
            element: <GuardHasAccount><GuardHasNomadList><Nomadlist /></GuardHasNomadList></GuardHasAccount>
          },
        ]
      },
      {
        path: 'settings',
        title: 'Settings',
        element: <GuardHasAccount><Settings /></GuardHasAccount>,
        children: [
          {
            path: 'profile',
            element: <GuardHasAccount><ProfileSettings /></GuardHasAccount>
          },
          {
            path: 'accounts',
            element: <GuardHasAccount><AccountsSettings /></GuardHasAccount>
          },
          {
            path: 'login',
            element: <GuardHasAccount><SignInSignUp /></GuardHasAccount>
          },
          {
            path: 'server',
            element: <GuardHasAccount><ServerSettings /></GuardHasAccount>
          },
          {
            path: 'security',
            element: <GuardHasAccount><SecuritySettings /></GuardHasAccount>
          },
          {
            path: 'subscription',
            element: <GuardHasAccount><SubscriptionSettings /></GuardHasAccount>
          },
          {
            path: 'import/export/',
            element: <GuardHasAccount><ImportExportSettings /></GuardHasAccount>
          },
          {
            path: 'social',
            element: <GuardHasAccount><SocialNetworksSettings /></GuardHasAccount>
          },
          {
            path: 'theme',
            element: <GuardHasAccount><ThemeSettings /></GuardHasAccount>
          },
          {
            path: 'application',
            element: <GuardHasAccount><AppSettings /></GuardHasAccount>
          },
          {
            path: 'development',
            element: <GuardHasAccount><GuardIsDeveloper><DevelopmentSettings /></GuardIsDeveloper></GuardHasAccount>
          },
          {
            path: 'help',
            element: <GuardHasAccount><HelpSettings /></GuardHasAccount>
          },
        ]
      },
      {
        path: 'crash',
        title: 'Crash report',
        element: <ForceBugReport />,
      },
      {
        path: 'reset',
        title: 'Reset',
        element: <Reset />,
      },
      {
        path: '*',
        element: <Navigate replace to={`/`} />,
      },
    ],
  }
];

export default routes;