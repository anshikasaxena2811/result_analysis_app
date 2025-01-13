FROM node:18-alpine AS build
WORKDIR /app
COPY . /app/
COPY ./package.json /app/
COPY ./package-lock.json /app/
RUN npm install
CMD ["npm", "run", "dev"]
