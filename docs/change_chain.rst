Exchange rate
=============

Seven23 webapp allows to switch currency at any point, and manage to estimate the price for each transaction. Sound great, but this is implemented in a dummy way and **do not garanty exactitude** on it.

Rates
-----

Exchange rate is based on the ``change`` model. Each change has a date, two currency and two amount involved in the transaction. For each change, we can calculate the exact exchange rate.

One easy way to do is to generate what we called a **changeChain** which is technically an array of change order by date. We loop on the array and for each change, save the current rate for each currenty so this way for any date, we only need to access the latest change item from the chain based on its date to have all current exchange rate.

To calculate a transaction price, we look at its date, and get the earliest past change event for .

Second degree rates
-------------------

One use-case we wanted to handle is the *second degree rates*. If you have euros, exchange them with swiss franc, them exchange swiss francs with thai baths, we wanted to be able to estimate an exchange rate between euros and thai baths.

To do so, we loop on the *changeChain* and for each one, we calculate what would be a two jump with the exchange we are browsing on. **This might give very different result based on how we browse the chain and is a known issue, but is better than nothing.**

.. note::

  In app, we display second degree calculation with an average sign ``≈`` in front of each prive.


First rates
-----------

A last situation is about defining an exchange rate before any change event occured. To solve this, we store in a ``firstRated`` object each rate to use as default. This one is generated **first time a rate or a secondDegree rate is changed** and used as a default value if needed.