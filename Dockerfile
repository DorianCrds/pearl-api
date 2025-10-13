# Use the official Node.js 20 Alpine image for a lightweight container
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the port the app will run on
EXPOSE 4000

# Default command to run the development server
CMD ["npm", "run", "dev"]
