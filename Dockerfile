FROM node:14.15.4-alpine
WORKDIR "/app"
COPY package*.json ./
RUN npm install
RUN npm install -g nodemon
COPY . .
EXPOSE 5000
CMD ["npm", "run", "start"]
