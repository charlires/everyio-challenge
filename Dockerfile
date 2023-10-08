FROM node:18-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY tsconfig.json ./

RUN npm ci

COPY ./src ./src

RUN npm run build

RUN rm -rf src

CMD ["npm", "start"]