import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./Amount.scss";

function Amount(props) {
  const {
    value,
    inverseColors,
    currency,
    accurate,
    isPending,
    className,
    forceSign,
    tabularNums,
  } = props;
  const [style, setStyle] = useState(props.style);
  const isConfidential = useSelector((state) => state.app.isConfidential);

  useEffect(() => {
    if (props.style == "balance") {
      setStyle(props.style);
    } else if (props.style == "colored") {
      if (props.isPending) {
        setStyle("pending");
      } else if (parseFloat(value) < 0) {
        setStyle(inverseColors ? "positive" : "negative");
      } else if (parseFloat(value) > 0) {
        setStyle(inverseColors ? "negative" : "positive");
      } else {
        setStyle("positive");
      }
    }
  }, [props.style, value, isPending]);

  // Used in render method to display currency value
  const generateString = (value = 0, currency, accurate = true) => {
    let digits = 2;
    let string;

    // Define decimal rules based on actual value
    if (value != 0) {
      if (Math.abs(value) < 0.01) {
        digits = 4;
      } else if (Math.abs(value) < 0.1) {
        digits = 3;
      }
    }

    // Generate number based on JS .toLocaleString method
    string = Math.abs(value)
      .toLocaleString(
        undefined, // use a string like 'en-US' to override browser locale
        { minimumFractionDigits: digits, maximumFractionDigits: digits }
      )
      .replace(",", "<span>,</span>")
      .replace(".", "<span>.</span>");

    // If confidential mode is activated, we replace numbers by 'X'
    if (isConfidential) {
      string = string.replace(/[0-9]/g, "█");
    }

    // Add positive or negative sign before the amount.
    if (value < 0) {
      string = "<span>-&nbsp;</span>" + string;
    } else if (forceSign) {
      string = "<span>+&nbsp;</span>" + string;
    }

    // Add currency sign before of after
    if (currency.after_amount) {
      string = `${string}&nbsp;<span class="sign after">${currency.sign}</span>`;
    } else {
      string = `<span class="sign">${currency.sign}</span>&nbsp;${string}`;
    }

    // Add not accurate caractere (≈)
    if (!accurate) {
      string = `≈ ${string}`;
    }

    return string;
  };

  return (
    <span
      className={
        "amount" +
        (className ? " " + className : "") +
        (isConfidential ? " isBlurred" : "") +
        (tabularNums ? " tabularNums" : "")
      }
    >
      {value !== undefined && value !== null && currency ? (
        <span
          className={style}
          dangerouslySetInnerHTML={{
            __html: generateString(value, currency, accurate),
          }}
        ></span>
      ) : (
        ""
      )}
    </span>
  );
}

function BalancedAmount(props) {
  return (
    <Amount
      value={props.value}
      currency={props.currency}
      accurate={props.accurate}
      tabularNums={props.tabularNums}
      style="balance"
    />
  );
}

function ColoredAmount(props) {
  return (
    <Amount
      value={props.value}
      currency={props.currency}
      accurate={props.accurate}
      isPending={props.isPending}
      tabularNums={props.tabularNums}
      style="colored"
      inverseColors={props.inverseColors}
      forceSign={props.forceSign}
    />
  );
}

export { Amount, BalancedAmount, ColoredAmount };
