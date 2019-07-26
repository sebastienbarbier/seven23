# build environment
FROM node:12.6.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN npm install &>/dev/null
COPY . /app
RUN npm run build

# production environment
FROM nginx:1.17.1-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
