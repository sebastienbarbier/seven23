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
    this.generateString = (value = 0, currency) => {
      var digits = 2;
      var string = '';
      if (Math.abs(value) < 0.01 && value != 0) {
        digits = 4;
      }

      string = Math.abs(value).toLocaleString(
        undefined, // use a string like 'en-US' to override browser locale
        { minimumFractionDigits: digits, maximumFractionDigits: digits }
      ).replace(',', '<span>,</span>').replace('.', '<span>.</span>');

      if (value < 0) {
        string = '<span>- </span>' + string;
      }

      if (currency.after_amount) {
        string = string + (currency.space ? ' ' : '') + '<span>' + currency.sign + '</span>';
      } else {
        string = '<span>' + currency.sign + '</span>' +  (currency.space ? ' ' : '') + string;
      }

      return string;
    };

  }

  render() {
    const { value, currency } = this.props;
    return (
      <span className="amount">
        { value !== undefined && value !== null && currency ?
          <span className={this.style} dangerouslySetInnerHTML={{__html: this.generateString(value, currency)}}></span>
          : ''
        }
      </span>
    );
  }
}

class BalancedAmount extends React.Component {
  render() {
    return (
      <Amount value={this.props.value} currency={this.props.currency} style="balance" />
    );
  }
}

class ColoredAmount extends React.Component {
  render() {
    return (
      <Amount value={this.props.value} currency={this.props.currency} style="colored"  />
    );
  }
}

export { Amount, BalancedAmount, ColoredAmount };
