# Dockerfile to build and run a NodeJS application
# using the official NodeJS image

# Use the Node18 image
FROM node:18 as base

# Set the working directory to /app
WORKDIR /app

# Copy the current package.json contents into the container at /app
COPY package.json /app

# Install any needed packages specified in package.json
RUN npm install

COPY . /app
RUN npm run build

FROM base as production

ENV NODE_ENV=production
ENV NODE_PATH=./build

# Copy the dist directory contents into the container at /app
COPY --from=base /app/dist /app

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run the app when the container launches
CMD ["node", "dist/index.js"]


