FROM node:14.15.4-alpine
WORKDIR "/app"
COPY package*.json ./
RUN npm install
Run npm install -g nodemon
RUN npm install -g express body-parser mongoose
RUN npm install --save express body-parser mongoose
COPY . .
EXPOSE 5000
CMD ["npm", "run", "start"]
