# Dockerfile for React client

# Build react client
FROM node:10.16-alpine

# Working directory be app
WORKDIR /usr/src/app

COPY ../../frontend/package*.json ./

###  Installing dependencies
RUN npm install --silent

# copy local files to app folder
COPY  ../../frontend .

EXPOSE 3000

CMD ["npm","start"]