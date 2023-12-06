import React from "react";
import {
  createBrowserRouter,
  Navigate
} from "react-router-dom";

// Get started section
import Layout from "./components/Layout";
import GetStarted from "./components/launcher/GetStarted";
import CreateAccount from "./components/launcher/CreateAccount";
import ImportAccount from "./components/launcher/ImportAccount";
import LoginForm from "./components/launcher/LoginForm";
import ServerForm from "./components/login/ServerForm";
import ForgottenPasswordForm from "./components/login/ForgottenPasswordForm";
import ResetPassword from "./components/ResetPassword";

// Main categories
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import Report from "./components/Report";
import Changes from "./components/Changes";
import ChangeList from "./components/changes/ChangeList";
import Categories from "./components/Categories";
import { Category } from './components/categories/Category';
import CategoriesSuggestions from './components/categories/CategoriesSuggestions';
import Settings from "./components/Settings";
import Reset from "./components/Reset";
import Search from "./components/Search";
import Convertor from "./components/Convertor";
import Nomadlist from "./components/Nomadlist";
import TripDetails from "./components/nomadlist/TripDetails";
import CityDetails from "./components/nomadlist/CityDetails";
import CountryDetails from "./components/nomadlist/CountryDetails";
import NotFound from "./components/NotFound";

import SettingsNavigation from "./components/settings/SettingsNavigation";

import AccountsSettings from "./components/settings/AccountsSettings";
import ProfileSettings from "./components/settings/ProfileSettings";
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

import ErrorBoundary from "./components/errors/ErrorBoundary";
import BugReport from "./components/errors/BugReport";

const routes = [
  {
    element: <ErrorBoundary fallback={<BugReport />}><Layout /></ErrorBoundary>,
    title: 'Root',
    children: [
      {
        path: '/',
        title: 'Get Started',
        element: <GuardHasNoAccount><GetStarted /></GuardHasNoAccount>,
      },
      {
        path: 'create-account',
        title: 'Create Account',
        back: '/',
        element: <GuardHasNoAccount><CreateAccount /></GuardHasNoAccount>,
      },
      {
        path: 'import-account',
        title: 'Import a .json file',
        back: '/login',
        element: <GuardHasNoAccount><ImportAccount /></GuardHasNoAccount>,
      },
      {
        path: 'login',
        title: 'Welcome back',
        back: '/',
        element: <GuardHasNoAccount><LoginForm /></GuardHasNoAccount>,
      },
      {
        path: 'server',
        title: 'Change server',
        back: '/login',
        element: <GuardHasNoAccount><ServerForm /></GuardHasNoAccount>,
      },
      {
        path: 'password/reset',
        title: 'Forgotten password',
        back: '/login',
        element: <GuardHasNoAccount><ForgottenPasswordForm /></GuardHasNoAccount>,
      },
      {
        path: 'resetpassword',
        title: 'Forgotten password',
        back: '/login',
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
        element: <GuardHasAccount><Navigate replace to={`/transactions/${year}/${month}`} /></GuardHasAccount>,
      },
      {
        path: 'transactions/:year/:month',
        element: <GuardHasAccount><Transactions /></GuardHasAccount>,
      },
      {
        path: 'transactions/:year/:month/:day',
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
            back: '/categories',
            element: <CategoriesSuggestions />
          },
          {
            path: ':id',
            back: '/categories',
            element: <GuardHasAccount><Category /></GuardHasAccount>
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
            back: '/changes',
            element: <GuardHasAccount><ChangeList /></GuardHasAccount>
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
            back: '/nomadlist',
            element: <GuardHasAccount><GuardHasNomadList><TripDetails /></GuardHasNomadList></GuardHasAccount>
          },
          {
            path: 'city/:slug',
            back: '/nomadlist',
            element: <GuardHasAccount><GuardHasNomadList><CityDetails /></GuardHasNomadList></GuardHasAccount>
          },
          {
            path: 'country/:slug',
            back: '/nomadlist',
            element: <GuardHasAccount><GuardHasNomadList><CountryDetails /></GuardHasNomadList></GuardHasAccount>
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
            title: 'Profile',
            back: '/settings',
            element: <GuardHasAccount><ProfileSettings /></GuardHasAccount>
          },
          {
            path: 'accounts',
            title: 'Accounts',
            back: '/settings',
            element: <GuardHasAccount><AccountsSettings /></GuardHasAccount>
          },
          {
            path: 'login',
            title: 'Login',
            back: '/settings',
            element: <GuardHasAccount><SignInSignUp /></GuardHasAccount>
          },
          {
            path: 'server',
            title: 'Server',
            back: '/settings',
            element: <GuardHasAccount><ServerSettings /></GuardHasAccount>
          },
          {
            path: 'security',
            title: 'Security',
            back: '/settings',
            element: <GuardHasAccount><SecuritySettings /></GuardHasAccount>
          },
          {
            path: 'subscription',
            title: 'Subscription',
            back: '/settings',
            element: <GuardHasAccount><SubscriptionSettings /></GuardHasAccount>
          },
          {
            path: 'import/export/',
            back: '/settings',
            element: <GuardHasAccount><ImportExportSettings /></GuardHasAccount>
          },
          {
            path: 'social',
            title: 'Social',
            back: '/settings',
            element: <GuardHasAccount><SocialNetworksSettings /></GuardHasAccount>
          },
          {
            path: 'theme',
            title: 'Theme',
            back: '/settings',
            element: <GuardHasAccount><ThemeSettings /></GuardHasAccount>
          },
          {
            path: 'application',
            title: 'Application',
            back: '/settings',
            element: <GuardHasAccount><AppSettings /></GuardHasAccount>
          },
          {
            path: 'development',
            title: 'Development',
            back: '/settings',
            element: <GuardHasAccount><GuardIsDeveloper><DevelopmentSettings /></GuardIsDeveloper></GuardHasAccount>
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