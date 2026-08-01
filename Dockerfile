# build environment
FROM node:24.18.1-alpine AS build
WORKDIR /app
ENV PATH=/app/node_modules/.bin:$PATH
COPY package.json package-lock.json .npmrc ./
RUN npm install -g npm@latest \
  && npm ci \
  && npx update-browserslist-db@latest
COPY . /app
RUN npm run build:no-progress --if-present

# production environment
FROM nginx:1.31.3-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
# Redirect 404 to index.html
RUN sed -ie "s|#error_page[[:blank:]]\+404[[:blank:]]\+.*|error_page 404 /index.html;|" /etc/nginx/conf.d/default.conf
