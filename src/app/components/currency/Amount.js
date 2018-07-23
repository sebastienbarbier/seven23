import './Amount.scss';
import React from 'react';

class Amount extends React.Component {

  constructor(props) {
    super(props);

    this.value = parseFloat(props.value);

    var digits = 2;
    if (Math.abs(this.value) < 0.01 && this.value != 0) {
      digits = 4;
    }

    this.string = Math.abs(this.value).toLocaleString(
      undefined, // use a string like 'en-US' to override browser locale
      { minimumFractionDigits: digits, maximumFractionDigits: digits }
    ).replace(',', '<span>,</span>').replace('.', '<span>.</span>');

    if (this.value < 0) {
      this.string = '<span>- </span>' + this.string;
    }

    this.currency = props.currency;

    if (this.currency.after_amount) {
      this.string = this.string + (this.currency.space ? ' ' : '') + '<span>' + this.currency.sign + '</span>';
    } else {
      this.string = '<span>' + this.currency.sign + '</span>' +  (this.currency.space ? ' ' : '') + this.string;
    }

    if (props.style == 'balance') {
      this.style = props.style;
    } else if (props.style == 'colored') {
      this.style = this.value < 0 ? 'negative' : 'positive';
    }
  }

  render() {
    return (
      <span className="amount">
        <span className={this.style} dangerouslySetInnerHTML={{__html: this.string}}></span>
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
