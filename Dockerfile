# build environment
FROM node:20.11.1-alpine as build
# Install python/pip to run node-saas build
ENV PYTHONUNBUFFERED=1
RUN apk add --no-cache make g++ git
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN apk add py3-pip
RUN apk add py3-setuptools
# Setup node then run build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN npm install -g npm@latest
RUN npm install
RUN npx update-browserslist-db@latest
COPY . /app
RUN npm run build:no-progress --if-present

# production environment
FROM nginx:1.25.2-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
# Redirect 404 to index.html
RUN sed -ie "s|#error_page[[:blank:]]\+404[[:blank:]]\+.*|error_page 404 /index.html;|" /etc/nginx/conf.d/default.conf