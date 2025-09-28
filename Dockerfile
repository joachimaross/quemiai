# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Build the NestJS app
RUN npm run build

# Expose port (default 4000)
EXPOSE 4000

# Start the app
CMD ["npm", "run", "start:prod"]
