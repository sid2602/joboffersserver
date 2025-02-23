# Use an official Node.js image as a base
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Install TypeScript globally if you want to run `ts-node`
RUN npm install -g typescript ts-node

# Expose the port your app will run on
EXPOSE 3000

# Run the application
CMD ["ts-node", "server.ts"]