import storage from '../storage';
import AccountStore from '../stores/AccountStore';
import ChangeStore from '../stores/ChangeStore';

class Transaction {

  constructor(obj) {
    this.data = {
      id: obj.id,
      user: obj.user,
      account: obj.account,
      name: obj.name,
      date: obj.date,
      originalAmount: obj.local_amount,
      originalCurrency: obj.local_currency,
      category: obj.category,
			// Calculated value
      isConversionAccurate: true, // Define is exchange rate is exact or estimated
      isConversionFromFuturChange: false, // If we used future change to make calculation
      isSecondDegreeRate: false, // If we used future change to make calculation
      amount: obj.local_amount,
      currency: obj.local_currency,
    };
  }

	/**
	 * Calculate amount for a new currency
	 * @param  {Integer} newCurrency PrimaryKey of new Currency
	 * @return {Promise}
	 */
  convertTo = (newCurrency) => {
    let self = this;
    return new Promise((resolve, reject) => {
      try {

        if (newCurrency === self.data.originalCurrency) {
          self.data.isConversionAccurate = true;
          self.data.amount = self.data.originalAmount;
          resolve();
        } else {

          ChangeStore.getChangeChain().then((chain) => {
            console.log(chain);
            const result = chain.find((item) => {
              return item.date <= self.data.date;
            });

            self.data.currency = newCurrency;
            self.data.isConversionAccurate = false;
            self.data.isConversionFromFuturChange = false;
            self.data.isSecondDegreeRate = false;

            if (result) {
              var change = result;
              // If exchange rate exist, we calculate exact change rate
              if (change.rates.has(self.data.originalCurrency) &&
                  change.rates.get(self.data.originalCurrency).has(newCurrency)) {
                self.data.isConversionAccurate = true;
                self.data.amount = self.data.originalAmount * change.rates.get(self.data.originalCurrency).get(newCurrency);
              } else {
               // We take first Rating is available
                if (change.secondDegree.has(self.data.originalCurrency) &&
                    change.secondDegree.get(self.data.originalCurrency).has(newCurrency)) {
                  self.data.isSecondDegreeRate = true;
                  self.data.amount = self.data.originalAmount * change.secondDegree.get(self.data.originalCurrency).get(newCurrency);
                } else {
                  // We take secondDegree transaction if possible
                  if (ChangeStore.firstRating.has(self.data.originalCurrency) &&
                      ChangeStore.firstRating.get(self.data.originalCurrency).has(newCurrency)) {
                    self.data.isConversionFromFuturChange = true;
                    self.data.amount = self.data.originalAmount * ChangeStore.firstRating.get(self.data.originalCurrency).get(newCurrency);
                  } else {
                    // There is no transaciton, and no second degree.
                    // Right now, we do not check third degree.
                    self.data.amount = null;
                  }
                }
              }
              resolve();
            } else {
              self.data.amount = null;
              resolve();
            }
          });
        }
      } catch (exception) {
        reject(exception);
      }
    });
  };

	/**
	 * Format object as JSON to transit over REST API
	 * @return {Object}
	 */
  toJSON = () => {
    return {
      id: this.data.id,
      user: this.data.user,
      account: this.data.account,
      name: this.data.name,
      date: this.data.date,
      category: this.data.category ? this.data.category : undefined,
      local_amount: this.data.originalAmount,
      local_currency: this.data.originalCurrency,
    };
  };

	/**
	 * Update values using deepmerge algo. Update conversion too.
	 * @param  {Transaction} obj [description]
	 * @return {Promise}
	 */
  update = (obj) => {
    if (!(obj instanceof Transaction)) {
      throw new Error('Transaction.update argument sshould be a instance of Transaction');
    }
    return new Promise((resolve, reject) => {
      this.data.name = obj.name;
      this.data.date = obj.date;
      this.data.amount = obj.amount;
      this.data.category = obj.category;
      this.data.originalAmount = obj.originalAmount;
      this.data.originalCurrency = obj.originalCurrency;
      this.convertTo(this.data.currency).then(resolve).catch(reject);

    });
  };

	/************************************************
	**				GETTER SETTER
	*************************************************/
  get id() { return this.data.id; }
  get name() { return this.data.name; }
  get date() { return this.data.date; }
  get amount() { return this.data.amount; }
  get currency() { return this.data.currency; }
  get category() { return this.data.category; }
  get originalAmount() { return this.data.originalAmount; }
  get originalCurrency() { return this.data.originalCurrency; }

  get isConversionAccurate() { return this.data.isConversionAccurate; }
  get isConversionFromFuturChange() { return this.data.isConversionFromFuturChange; }
  get isSecondDegreeRate() { return this.data.isSecondDegreeRate; }
}

export default Transaction;
