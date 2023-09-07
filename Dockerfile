# build environment
FROM node:18.12.1-alpine as build
# Install python/pip to run node-saas build
ENV PYTHONUNBUFFERED=1
RUN apk add --no-cache make g++ git
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
# Setup node then run build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN npm install -g npm@9.7.2
RUN npm install caniuse-lite
RUN npm install
RUN npx browserslist@latest --update-db
COPY . /app
RUN npm run build:no-progress --if-present

# production environment
FROM nginx:1.25.2-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
# Redirect 404 to index.html
RUN sed -ie "s|#error_page[[:blank:]]\+404[[:blank:]]\+.*|error_page 404 /index.html;|" /etc/nginx/conf.d/default.conf