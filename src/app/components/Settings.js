/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import Card from "@material-ui/core/Card";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";

import IconButton from "@material-ui/core/IconButton";

import HelpIcon from "@material-ui/icons/HelpOutline";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import MoneyIcon from "@material-ui/icons/AttachMoney";
import CreditCard from "@material-ui/icons/CreditCard";
import StorageIcon from "@material-ui/icons/Storage";
import AvLibraryBooks from "@material-ui/icons/LibraryBooks";
import SettingsApplications from "@material-ui/icons/SettingsApplications";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import Lock from "@material-ui/icons/Lock";
import ImportExport from "@material-ui/icons/ImportExport";
import StyleIcon from "@material-ui/icons/Style";

import AccountsSettings from "./settings/AccountsSettings";
import ProfileSettings from "./settings/ProfileSettings";
import HelpSettings from "./settings/HelpSettings";
import ServerSettings from "./settings/ServerSettings";
import AppSettings from "./settings/AppSettings";
import SecuritySettings from "./settings/SecuritySettings";
import CurrenciesSettings from "./settings/CurrenciesSettings";
import ImportExportSettings from "./settings/ImportExportSettings";
import ThemeSettings from "./settings/ThemeSettings";
import SubscriptionSettings from "./settings/SubscriptionSettings";

import UserButton from "./settings/UserButton";

class Settings extends Component {
  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.component = null;

    this.SETTINGS = {
      PROFILE: {
        title: "User profile",
        url: "/settings/profile/",
        subtitle: "Configure your data",
        icon: <AccountBoxIcon />,
        component: (
          <ProfileSettings
            onModal={component =>
              component
                ? this.modal(component)
                : this.setState({ open: false, component: null })
            }
            history={this.history}
          />
        )
      },
      ACCOUNTS: {
        title: "Accounts",
        url: "/settings/accounts/",
        subtitle: "Manage yours accounts",
        icon: <AvLibraryBooks />,
        component: (
          <AccountsSettings
            onModal={component =>
              component
                ? this.modal(component)
                : this.setState({ open: false, component: null })
            }
          />
        )
      },
      CURRENCIES: {
        title: "Currencies",
        url: "/settings/currencies/",
        subtitle: "Select currencies to show",
        icon: <MoneyIcon />,
        component: <CurrenciesSettings />
      },
      SERVER: {
        title: "Server",
        url: "/settings/server/",
        subtitle: "Details about your hosting",
        icon: <StorageIcon />,
        component: <ServerSettings history={this.history} />
      },
      SECURITY: {
        title: "Security",
        url: "/settings/security/",
        subtitle: "Encryption key",
        icon: <Lock />,
        component: <SecuritySettings />
      },
      SUBSCRIPTION: {
        title: "Subscription",
        url: "/settings/subscription/",
        subtitle: "Paiement, invoice, and extend",
        icon: <CreditCard />,
        component: <SubscriptionSettings history={this.history} />
      },
      IMPORT_EXPORT: {
        title: "Import / Export",
        url: "/settings/import/export/",
        subtitle: "Backup and restore your data",
        icon: <ImportExport />,
        component: <ImportExportSettings />
      },
      THEME: {
        title: "Theme",
        url: "/settings/theme/",
        subtitle: "Light or dark mode",
        icon: <StyleIcon />,
        component: <ThemeSettings />
      },
      APP: {
        title: "Application settings",
        url: "/settings/application/",
        subtitle: "Version, force refresh",
        icon: <SettingsApplications />,
        component: <AppSettings />
      },
      HELP: {
        title: "Help / Support",
        url: "/settings/help/",
        subtitle: "Bug report, questions, or anything else",
        icon: <HelpIcon />,
        component: <HelpSettings />
      }
    };

    const page = this.SETTINGS[
      Object.keys(this.SETTINGS).find(
        key => this.SETTINGS[key].url === props.history.location.pathname
      )
    ];

    this.state = {
      open: false,
      page_title: page ? page.title : "",
      page
    };
  }

  componentWillReceiveProps(nextProps) {
    const page = this.SETTINGS[
      Object.keys(this.SETTINGS).find(
        key => this.SETTINGS[key].url === nextProps.history.location.pathname
      )
    ];

    this.setState({
      page_title: page ? page.title : this.state.page_title,
      page
    });
  }

  modal(component) {
    this.component = component;
    this.setState({
      open: true
    });
  }

  drawListItem(page) {
    return (
      <ListItem
        button
        onClick={(event, index) => {
          this.setState({ page: page.url });
          this.history.push(page.url);
        }}
        selected={this.state.page === page}
      >
        <ListItemIcon>{page.icon}</ListItemIcon>
        <ListItemText
          primary={page ? page.title : ""}
          secondary={page ? page.subtitle : ""}
        />
        <KeyboardArrowRight />
      </ListItem>
    );
  }

  render() {
    const { server } = this.props;
    const { page, page_title } = this.state;
    return (
      <div className="layout">
        <div className={"modalContent " + (this.state.open ? "open" : "")}>
          <Card square className="modalContentCard">
            {this.component}
          </Card>
        </div>
        <header className="layout_header showMobile">
          <div className="layout_header_top_bar">
            <div
              className={(!page ? "show " : "") + "layout_header_top_bar_title"}
            >
              <h2>Settings</h2>
            </div>
            <div
              className={(page ? "show " : "") + "layout_header_top_bar_title"}
              style={{ right: 80 }}
            >
              <IconButton onClick={() => this.history.push("/settings")}>
                <KeyboardArrowLeft style={{ color: "white" }} />
              </IconButton>
              <h2 style={{ paddingLeft: 4 }}>{page_title}</h2>
            </div>
            <div className="showMobile">
              <UserButton history={this.history} type="button" color="white" />
            </div>
          </div>
        </header>

        <div className="layout_two_columns">
          <div
            className={(page ? "hide " : "") + "layout_content wrapperMobile"}
          >
            <List
              subheader={
                <ListSubheader disableSticky={true}>Your account</ListSubheader>
              }
            >
              {this.drawListItem(this.SETTINGS.ACCOUNTS)}
              {this.drawListItem(this.SETTINGS.IMPORT_EXPORT)}
            </List>
            <List
              subheader={
                <ListSubheader disableSticky={true}>Hosting</ListSubheader>
              }
            >
              {this.drawListItem(this.SETTINGS.PROFILE)}
              {this.drawListItem(this.SETTINGS.SERVER)}
              {this.drawListItem(this.SETTINGS.SECURITY)}
              {server.saas ? this.drawListItem(this.SETTINGS.SUBSCRIPTION) : ""}
            </List>

            <List
              subheader={
                <ListSubheader disableSticky={true}>
                  More settings
                </ListSubheader>
              }
            >
              {this.drawListItem(this.SETTINGS.APP)}
              {this.drawListItem(this.SETTINGS.THEME)}
              {this.drawListItem(this.SETTINGS.HELP)}
            </List>
          </div>

          {page ? <div className="layout_noscroll">{page.component}</div> : ""}
        </div>
      </div>
    );
  }
}

Settings.propTypes = {
  server: PropTypes.object.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return { server: state.server };
};

export default connect(mapStateToProps)(Settings);
