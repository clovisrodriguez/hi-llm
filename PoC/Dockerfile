# Use the official Node.js LTS image
FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]