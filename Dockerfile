FROM node:current-alpine3.18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json
COPY package*.json ./

# Install pnpm
RUN npm install -g pnpm

# Install app dependencies
RUN pnpm install

# Copy all files
COPY ./ ./

RUN npx prisma generate
RUN pnpm run build

EXPOSE 3000

CMD [ "pnpm", "start" ]