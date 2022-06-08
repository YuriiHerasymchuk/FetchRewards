FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8000
RUN npm run build
CMD [ "node", "./dist/app.js" ]