# Change Log

All notable changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).
 
<!---
## [Unreleased] - yyyy-mm-dd

### ✨ Feature – for new features
### 🛠 Improvements – for general improvements
### 🚨 Changed – for changes in existing functionality
### ⚠️ Deprecated – for soon-to-be removed features
### 📚 Documentation – for documentation update
### 🗑 Removed – for removed features
### 🐛 Bug Fixes – for any bug fixes
### 🔒 Security – in case of vulnerabilities
### 🏗 Chore – for tidying code

See for sample https://raw.githubusercontent.com/favoloso/conventional-changelog-emoji/master/CHANGELOG.md
-->

## [2.0.2] - 2024-MM-DD
### 📚 Documentation
- Fix documentation (#156)
### ✨ Feature
-  Improve end-to-end testing (#155)

## [2.0.1] - 2024-03-04
### 🐛 Bug Fixes
- Remove pending payments from trends (#132)
### 🔒 Security
- Update dependencies (#133)

## [2.0.0] - 2024-01-02
### 🛠 Improvements
- Improve dark mode (#86)
- New in app navigation (#90)
- New GraphLine with better integration (#93)
- Add Transaction "cleared" field (#110)
- Installation guide as PWA (#118)
- Subscription model with stripe (#119)
### 🐛 Bug Fixes
- Update app button does not load new version (#120)
### 🔒 Security
- Update dependencies (#117)

## [1.2.1] - 2023-09-07
### 🐛 Bug Fixes
- The Dockerfile fails at 'npm install' (#115)

## [1.2.0] - 2023-07-06
### 🛠 Improvements
- Handle uncaught exception with a bug report view (#84)
- Implement a developer mode in app (#85)
- Refactor the settings panel using react-router (#88)
- Different icon between current and next version (#92)
- List of categories includes a no category value (#94)
- Confirmation view for your encryption key (#95)
- Run e2e with local docker backend (#112)
### 🐛 Bug Fixes
- Fix Snackbar manager not working if no account (#87)
- Dashboard crash (#108)
- Add missing 'No category label' on mobile list of category (#111)
- Fix npm install by updating dependencies (#113)

## [1.1.4] - 2023-02-27
### 🐛 Bug Fixes
- Dashboard calendar view show more than 3 months (#103)
- Unexpected DELETE request for local transactions (#104)

## [1.1.3] - 2023-01-28
### 🛠 Improvements
-  Update favicon (#96)
### 🐛 Bug Fixes
-  Category no longer sync (#98)
-  CI/CD fail with latest version (#99)

## [1.1.2] - 2022-12-19
### 🐛 Bug Fixes
- CalendarGraph crash on start (#82)

## [1.1.1] - 2022-12-16
### 🐛 Bug Fixes
- Sync is broken on update event (#78)
- Dashboard graph shows one extra day/month than selected (#79)

## [1.1.0] - 2022-12-13
### 🐛 Bug Fixes
- Crash on sync when app edit before creating (#71)
### 🛠 Improvements
- Improved enrollment for new users (#63)
- Make dashboard move relevant for new users (#64)
- Add a new calendar graph (#65)
- Category list in transactions view ignores incomes (#70)

## [1.0.1] - 2022-10-10
### 🐛 Bug Fixes
- Fix Datefield crash when editing the Textfield manually (#55)
- Fix CategoryField selecting wrong item (#56)
### 🔒 Security
- Update dependencies (#58) 

## [1.0.0] - 2022-06-08
### ✨ Feature
- List transactions, categories, and exchange rates.
- Offline enabled.
- Recursive transactions.
- Display your transactions using any exchanged currency.
- Multi device sync with end-to-end encryption.
- Responsive design for mobile, tablet, and desktop.
- Dark theme.
- Multiple accounts.
- Dashboard view with trends and summaries.
- Report generator for selected date range.
- Search engine for your transactions.
- Convertor based on provided rates.
- Import/Export your data as JSON.
- Hide numeric values.
- Nomadlist integration.