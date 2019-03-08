import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  container: {
    padding: '10px 20px 40px 20px',
    fontSize: '0.9rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  avatar: {
    borderRadius: '50%',
    flexGrow: 0,
    flexShrink: 0,
    width: 100,
    height: 100,
    margin: '20px 20px 20px 0',
    boxShadow: '0px 0px 6px ' + theme.palette.divider,
    color: 'transparent',
  },
  description: {
    flex: '300px'
  },
  thanks: {
    textAlign: 'center',
    padding: '40px 40px'
  }
});

class HelpSettings extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    const { classes } = this.props;
    return (
      <div className="layout_content wrapperMobile">
        <div className={classes.container}>
          <header className={classes.header}>
            <img
              src="/images/sebastienbarbier_freelance_profile.jpg"
              alt="Sébastien Barbier Profile picture"
              className={classes.avatar} />
            <p className={classes.description}>Hi, <strong>my same is Sébastien</strong> and I am the maker of this application.<br />As this is a one personn project, it might have some <strong>technical issues and unavailability</strong>. I apologize if it is the case. However I developed it for myself and <strong>use it everyday</strong>, so you can be confident that I will <strong>do my best to maintain it</strong>.</p>
          </header>
          <h2>Reach to me</h2>
          <p>For now, the easiest way for help is by <strong>sending me a direct email</strong> at:</p>
          <Button variant="contained" color="primary" href='mailto:contact@sebastienbarbier.com'>contact@sebastienbarbier.com</Button>
          <p>If it takes too long to have an answer, please feel free to <strong>ping me directly on twitter</strong>:</p>
          <Button size="small" color="primary" href='https://twitter.com/Sebbarbier' target="_blank">Twitter: @SebBarbier</Button>

          <h2>Bug report</h2>
          <p>If you are a developer, or feel confident <strong>reporting issue on our bug tracker</strong>, you can do so directly on our github page.</p>
          <Button size="small" color="primary" href='https://github.com/sebastienbarbier/seven23_webapp' target="_blank">Github: sebastienbarbier/seven23_webapp</Button>
          <p className={classes.thanks}>Thanks for using the app, I hope you are enjoying it, and that together we can make it work better 🙌</p>
        </div>
      </div>
    );
  }
}


HelpSettings.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(HelpSettings);