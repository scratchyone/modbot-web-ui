FROM node:16-alpine
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install --force

COPY . .
RUN npm run build
CMD ["npm", "run", "start"]
