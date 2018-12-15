import './Amount.scss';
import React from 'react';

class Amount extends React.Component {

  constructor(props) {
    super(props);

    if (props.style == 'balance') {
      this.style = props.style;
    } else if (props.style == 'colored') {
      this.style = parseFloat(props.value) < 0 ? 'negative' : 'positive';
    }

    // Used in render method to display currency value
    this.generateString = (value = 0, currency, accurate = true) => {
      var digits = 2;
      var string = '';
      if (Math.abs(value) < 0.99 && value != 0) {
        digits = 3;
      }
      if (Math.abs(value) < 0.01 && value != 0) {
        digits = 4;
      }

      string = Math.abs(value).toLocaleString(
        undefined, // use a string like 'en-US' to override browser locale
        { minimumFractionDigits: digits, maximumFractionDigits: digits }
      ).replace(',', '<span>,</span>').replace('.', '<span>.</span>');

      if (value < 0) {
        string = '<span>-&nbsp;</span>' + string;
      }

      if (currency.after_amount) {
        string = string + (currency.space ? '&nbsp;' : '') + '<span>' + currency.sign + '</span>';
      } else {
        string = '<span>' + currency.sign + '</span>' +  (currency.space ? '&nbsp;' : '') + string;
      }

      return (!accurate ? '&#8776; ' : '') + string;
    };

  }

  render() {
    const { value, currency, accurate } = this.props;
    return (
      <span className="amount">
        { value !== undefined && value !== null && currency ?
          <span className={this.style} dangerouslySetInnerHTML={{__html: this.generateString(value, currency, accurate)}}></span>
          : ''
        }
      </span>
    );
  }
}

class BalancedAmount extends React.Component {
  render() {
    return (
      <Amount value={this.props.value} currency={this.props.currency} accurate={this.props.accurate} style="balance" />
    );
  }
}

class ColoredAmount extends React.Component {
  render() {
    return (
      <Amount value={this.props.value} currency={this.props.currency} accurate={this.props.accurate} style="colored"  />
    );
  }
}

export { Amount, BalancedAmount, ColoredAmount };
