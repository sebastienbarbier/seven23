# Specifications

## Goals at the end of this sprint

- Rebrand (name, logo, design)
- Good enough to release as Saas version (29€/year)

## About this app

Will stay a one personn project. keeping that in mind, evey new features is really time consuming.
Hope to generate some income with Saas version, but main goal is to use in my portfolio.

## Concept

Personnal budget app (or Personal Finance Manager), to track expenses per month, per category, and per event.

**Main arguments:** Multi currency, multi account, shared budget for events, self hostable, open source.

*Build with intensive traveling in mind (not sure if we should target this audience first).*

**What this app will not do:** Connect to bank account and automatically report transaction. Be used to pay bills. I guess it's more of a tracking than a managing system.

## Structure

Code is web based, but could/will be bundle as native app (desktop, tablet, phone). Needs to be responsive, same code for every plateform. Design should be app oriented, not website oriented.

### Website

- Homepage

### App

- Login page
  - Sign up
  - Forgotten password
  - Change server
  - Legal and copyright
- App page
  - Dashboard
  - Transactions (per month, with categories)
  - Categories
  - Events (shared budget feature)
  - Changes
  - Settings

### Chatbot (not implemented yet)

- Simple form to create new transaction. Should be faster than using the app.

## Key word

Simplicity. Efficiency.

## Fun facts

- This project was first named **723e** *(723e.com)*. Was created because my month salary was 723 euros and I needed an app to properly manage it. Tryed to rebrand **seven23** but ... need to be convainced about it.
- Before this, I was using an Apple Number spreedsheats *(I know, stupid idea)*, but data got corrupted and everything got lost. This was like april 2009 *(yeap, that's a long story)*.

## Current version

Website does not exist yet. Will be [seven23.io](seven23.io). Content need to be defined.

Working prototype using Google Material design. Available at [app.seven23.io](app.seven23.io).
It works, that's his main quality right now 😒.

Need to improve pedagogy, should be more explicit and guide new users.
Should provide a set of default categories.
Currently only one user, and two testers :). Very small project, but used everyday.

## App description

### Dashboard

Current version was made very quickly as proof of concept. Still need to be defined.
Goal of this page is to answer the question : **how are things going?**

### Transactions (per month, with categories)

List of transactions per month. Order by date, with a graph per day and a sum per category.
A transaction has a date, a name, a category, and an amount.
Filters should be implemented, per category and/or per day.
Goal of this page is to answer the question : **How was that month?**

### Categories

List of category. Each category give access to a graph of summ per month to see evolution, and a list of related transaction.
If we delete a category which still has assigned transactions, we do not delete but disable/hide it. User should be able to undelete it *(or migrate all transactions ?)*.
Goal of this page is to answer the question : **How did my spending in this category evolved?**

### Events (shared budget feature) * Not implemented yet *

Event could be a weekend in Paris, a sport competition ...
Goal of this page is to answer the question : **How much did this event cost me ?**
Should also manage shared budget. Who paid what for who, and who should pay how much to who.

### Changes

Register all currency exchange to allow accurate conversion.
Goal of this page is to answer the question : **How did the exchange rate evolved ?**

### Settings

Can change email, password. Create, edit, delete accounts.
Should be flexible and easy to add content.

## Existing tools

### Mint: Personal Finance, Money Manager, Bill Pay, Credit Score ...

[https://www.mint.com/](https://www.mint.com/)

### Quicken 2017: Personal Finance, Money Management, Budgeting

[https://www.quicken.com/](https://www.quicken.com/)

### Clarity Money - Champion of Your Money

[https://claritymoney.com/](https://claritymoney.com/)

### Pennies for iPhone - Personal Money, Budget & Finance Manager

[https://www.getpennies.com/](https://www.getpennies.com/)

### Financial Software and Wealth Management | Personal Capital

[https://www.personalcapital.com/](https://www.personalcapital.com/)

### Best personal finance software and budget app - EveryDollar

[https://www.everydollar.com/](https://www.everydollar.com/)

## Ideas

1. **Loading animation**: using skeleton screens.
	[https://css-tricks.com/building-skeleton-screens-css-custom-properties/](https://css-tricks.com/building-skeleton-screens-css-custom-properties/)

2. Having more charts, like this **calendar view**: [https://bl.ocks.org/mbostock/4063318](https://bl.ocks.org/mbostock/4063318)  
  	or any from D3: [https://github.com/d3/d3/wiki/Gallery](https://github.com/d3/d3/wiki/Gallery)