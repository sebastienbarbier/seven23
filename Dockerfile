# build environment
FROM node:12.7.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN npm install &>/dev/null
COPY . /app
RUN npm run build

# production environment
FROM nginx:1.17.2-alpine
COPY --from=build /app/build /usr/share/nginx/html
RUN sed -ie "s|#error_page[[:blank:]]\+404[[:blank:]]\+.*|error_page 404 /index.html;|" /etc/nginx/conf.d/default.conf
