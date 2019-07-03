/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { useRouter } from "../../router";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Divider from "@material-ui/core/Divider";

import AccountsActions from "../../actions/AccountsActions";

const ITEM_HEIGHT = 48;

const styles = {
  list: {
    padding: 0
  }
};

export default function CurrencySelector(props) {
  const dispatch = useDispatch();
  const { history } = useRouter();
  const [isDisabled, setIsDisabled] = useState(props.disabled);
  const favoritesCurrencies = useSelector(state =>
    state.user &&
    state.user.profile &&
    state.user.profile.favoritesCurrencies &&
    state.user.profile.favoritesCurrencies.length
      ? state.user.profile.favoritesCurrencies
      : [state.account.currency]
  );
  const currencies = useSelector(state =>
    state.currencies.filter(currency =>
      favoritesCurrencies.includes(currency.id)
    )
  );
  const selectedCurrency = useSelector(state =>
    state.account
      ? state.currencies.find(c => c.id === state.account.currency)
      : null
  );

  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = event => {
    event.preventDefault();
    if (props.onClick) {
      props.onClick();
    }

    setAnchorEl(event.currentTarget);
    setIsOpen(true);
  };

  const handleChange = currency => {
    if (props.onChange) {
      props.onChange();
    }

    dispatch(AccountsActions.switchCurrency(currency));
    setIsOpen(false);
  };

  return (
    <div className={props.className}>
      {selectedCurrency ? (
        <div>
          <List style={styles.list}>
            <ListItem
              button
              aria-owns={isOpen ? "menu-list-grow" : null}
              aria-haspopup="true"
              disabled={isDisabled}
              onClick={event => handleOpen(event)}
            >
              <ListItemText>
                {selectedCurrency[props.display || "name"]}
              </ListItemText>
              <ExpandMore color="action" />
            </ListItem>
          </List>

          <Menu
            id="long-menu"
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            getContentAnchorEl={null}
            open={Boolean(isOpen)}
            onClose={() => setIsOpen(false)}
            PaperProps={{
              style: {
                maxHeight: ITEM_HEIGHT * 4.5,
                width: 200
              }
            }}
          >
            {currencies.map(currency => (
              <MenuItem
                key={currency.id}
                selected={currency.id === selectedCurrency.id}
                onClick={() => {
                  handleChange(currency);
                }}
              >
                {currency.name}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem
              onClick={() => {
                setIsOpen(false);
                history.push("/settings/currencies/");
              }}
            >
              More ...
            </MenuItem>
          </Menu>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

// class CurrencySelector extends Component {
//   constructor(props) {
//     super(props);
//     this.history = props.history;
//     this.state = {
//       display: props.display || "name",
//       currencies: props.currencies.filter(currency =>
//         props.favoritesCurrencies.includes(currency.id)
//       ),
//       selectedCurrency: props.currencies.find(
//         c => c.id === props.account.currency
//       ),
//       open: false,
//       anchorEl: null,
//       disabled: props.disabled
//     };
//   }

//   handleOpen = event => {
//     const { onClick } = this.props;
//     // Propagate onClick action to parent element
//     if (onClick) {
//       onClick();
//     }

//     // This prevents ghost click.
//     event.preventDefault();
//     this.setState({
//       open: true,
//       anchorEl: event.currentTarget
//     });
//   };

//   handleRequestClose = () => {
//     this.setState({
//       open: false
//     });
//   };

//   handleChange = currency => {
//     const { onChange } = this.props;
//     // Propagate onClick action to parent element
//     if (onChange) {
//       onChange();
//     }

//     const { dispatch } = this.props;
//     dispatch(AccountsActions.switchCurrency(currency));

//     this.setState({
//       open: false
//     });
//   };

//   componentWillReceiveProps(newProps) {
//     this.setState({
//       currencies: newProps.currencies.filter(currency =>
//         newProps.favoritesCurrencies.includes(currency.id)
//       ),
//       selectedCurrency: newProps.currencies.find(
//         c => c.id === newProps.account.currency
//       ),
//       disabled: newProps.disabled
//     });
//   }

//   render() {
//     const {
//       selectedCurrency,
//       currencies,
//       anchorEl,
//       open,
//       disabled,
//       display
//     } = this.state;
//     const { className } = this.props;
//     return (
//       <div className={className}>
//         {this.state.selectedCurrency ? (
//           <div>
//             <List style={styles.list}>
//               <ListItem
//                 button
//                 ref={node => {
//                   this.target1 = node;
//                 }}
//                 aria-owns={open ? "menu-list-grow" : null}
//                 aria-haspopup="true"
//                 disabled={disabled}
//                 onClick={this.handleOpen}
//               >
//                 <ListItemText>{selectedCurrency[display]}</ListItemText>
//                 <ExpandMore color="action" />
//               </ListItem>
//             </List>

//             <Menu
//               id="long-menu"
//               anchorEl={anchorEl}
//               anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//               getContentAnchorEl={null}
//               open={Boolean(open)}
//               onClose={this.handleRequestClose}
//               PaperProps={{
//                 style: {
//                   maxHeight: ITEM_HEIGHT * 4.5,
//                   width: 200
//                 }
//               }}
//             >
//               {currencies.map(currency => (
//                 <MenuItem
//                   key={currency.id}
//                   selected={currency.id === selectedCurrency.id}
//                   onClick={() => {
//                     this.handleChange(currency);
//                   }}
//                 >
//                   {currency.name}
//                 </MenuItem>
//               ))}
//               <Divider />
//               <MenuItem
//                 onClick={() => {
//                   this.history.push("/settings/currencies/");
//                   this.setState({
//                     open: false
//                   });
//                 }}
//               >
//                 More ...
//               </MenuItem>
//             </Menu>
//           </div>
//         ) : (
//           ""
//         )}
//       </div>
//     );
//   }
// }

// CurrencySelector.propTypes = {
//   dispatch: PropTypes.func.isRequired,
//   currencies: PropTypes.array.isRequired,
//   favoritesCurrencies: PropTypes.array.isRequired,
//   account: PropTypes.object.isRequired
// };

// const mapStateToProps = (state, ownProps) => {
//   let favoritesCurrencies =
//     state.user && state.user.profile
//       ? state.user.profile.favoritesCurrencies
//       : [];
//   if (favoritesCurrencies.length == 0) {
//     favoritesCurrencies = [state.account.currency];
//   }
//   return {
//     currencies: state.currencies,
//     favoritesCurrencies: favoritesCurrencies,
//     account: state.account
//   };
// };

// export default connect(mapStateToProps)(withRouter(CurrencySelector));
