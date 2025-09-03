# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Copy app source code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Run the application
CMD [ "node", "server.js" ]
