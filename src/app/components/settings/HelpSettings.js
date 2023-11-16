import React, { Component } from "react";
import PropTypes from "prop-types";

import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';

class HelpSettings extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <Container sx={{ pt: 4 }}>
        <Typography variant="h5" sx={{ pb: 2 }}>Help / Support</Typography>

        <p>Our support team is here to help you with any issues or questions you may have.</p>
        <p>You can reach us in a few different ways:</p>

          <ul>

            <li><strong>Email</strong>: Send us an email at <Link href="mailto:support@seven23.io">support@seven23.io</Link> and one of our team members will respond to you as soon as possible.</li>
            <li><strong>Twitter</strong>: You can also contact us on Twitter by tweeting at our handle <Link href="https://twitter.com/Seven23_app" target="_blank">Seven23_app</Link>. We'll do our best to respond to your tweet as quickly as possible.</li>
            <li><strong>GitHub</strong>: If you have a specific issue with our app or website, you can create a GitHub issue on <Link href="https://github.com/sebastienbarbier/seven23" target="_blank">our repository</Link>. This is the best way to report bugs or request new features.</li>
          </ul>

        <p>We strive to provide timely and helpful support to all of our users.<br/>Thank you for choosing our product, and please don't hesitate to reach out to us for assistance</p>

      </Container>
    );
  }
}

export default HelpSettings;