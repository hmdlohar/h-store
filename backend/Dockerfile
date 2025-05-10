# Use Node.js 20 slim as the base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=2008

# Expose the port the app runs on
EXPOSE 2008

# Use shell form to ensure signal propagation
CMD ["sh", "-c", "node app.js"]
