/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

import UserActions from '../../../actions/UserActions';

const styles = theme => ({
  root: {
    display: 'flex',
  },
  formControl: {
    margin: theme.spacing.unit * 3,
  },
  group: {
    margin: `${theme.spacing.unit}px 0`,
  },
});

class AvatarForm extends Component {
  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      avatar: props.avatar,
      loading: false,
      onSubmit: props.onSubmit,
      onClose: props.onClose,
      error: {}, // error messages in form from WS
    };
  }

  handleAvatarChange = event => {
    this.setState({
      avatar: event.target.value,
    });
  };

  save = e => {

    if (e) { e.preventDefault(); }

    this.setState({
      error: {},
      loading: true,
    });

    const { avatar } = this.state;
    const { dispatch } = this.props;

    dispatch(UserActions.update({ profile: { avatar } }))
      .then(() => {
        this.props.onSubmit();
      })
      .catch((error) => {
        if (error && error['email']) {
          this.setState({
            error: error,
            loading: false,
          });
        }
      });
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.email !== nextProps.email) {
      nextProps.onSubmit();
    } else {
      this.setState({
        loading: false,
        onSubmit: nextProps.onSubmit,
        onClose: nextProps.onClose,
        error: {}, // error messages in form from WS
      });
    }
  }

  componentDidMount() {
  }

  render() {
    const { classes } = this.props;
    const { onClose } = this.state;
    return (
      <form onSubmit={this.save} className="content">
        <header>
          <h2 style={{ color: 'white' }}>Avatar</h2>
        </header>
        {this.state.loading ? <LinearProgress mode="indeterminate" /> : ''}
        <div className="form">
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">From</FormLabel>
            <RadioGroup
              aria-label="origin"
              name="origin"
              className={classes.group}
              value={this.state.avatar}
              onChange={this.handleAvatarChange}
            >
              <FormControlLabel value="NONE" control={<Radio />} label="None" />
              <FormControlLabel value="GRAVATAR" control={<Radio />} label="Gravatar" />
            </RadioGroup>
          </FormControl>
        </div>
        <footer>
          <Button onClick={onClose} >Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            style={{ marginLeft: '8px' }}
          >Submit</Button>
        </footer>
      </form>
    );
  }
}

AvatarForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  avatar: PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    avatar: state.user.profile.profile.avatar,
  };
};

export default withStyles(styles)(connect(mapStateToProps)(AvatarForm));