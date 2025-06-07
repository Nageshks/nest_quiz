# Use the official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better build caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Build the NestJS app
RUN npm run build

# Expose the port (adjust if your app uses a different one)
EXPOSE 3000

# Run the app
CMD ["npm", "run", "start:prod"]