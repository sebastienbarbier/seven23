# Seven23 webapp

[![Build action badge](https://github.com/sebastienbarbier/seven23/actions/workflows/build.yaml/badge.svg?branch=main)](https://github.com/sebastienbarbier/seven23/actions/) [![Documentation Status](https://readthedocs.org/projects/seven23/badge/?version=latest)](https://seven23.readthedocs.io/en/latest/?badge=latest) [![Status](https://status.seven23.io/badge.svg)](https://status.seven23.io) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/sebastienbarbier/seven23/blob/main/LICENSE)

Fully manual budget app to track your expenses. Completely opensource, with privacy by design.

- [Seven23 official website](https://seven23.io/)
- [Web application](https://app.seven23.io/)
- [Documentation](https://seven23.readthedocs.io/en/latest/)
- [Issue tracker](https://github.com/sebastienbarbier/seven23/issues)
- [Code repository](https://github.com/sebastienbarbier/seven23)
- [Change log](https://github.com/sebastienbarbier/seven23/blob/main/CHANGELOG.md)

App can run on device, **no account needed**, but need a server instance to sync and backup your data. 
Server code is also open source and available as a separate repository: [seven23_server](https://github.com/sebastienbarbier/seven23_server).

![Seven23 Screenshot](https://cellar-c2.services.clever-cloud.com/cdn.seven23.io/static/images/transactions-light.png)


## Quickstart

### Run locally

```
nvm use
npm i
npm start
```

### Run backend lcoally

```
npm run backend
```

### Run locally from public docker image

```

```

### Building docker

```
docker build -t seven23_app -f Dockerfile .
docker run -p 8000:80 seven23_app
```

Web app is available at [http://localhost:8000](http://localhost:8000)