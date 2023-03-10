FROM node:16-alpine
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install --force

COPY . .
RUN chmod +x ./entrypoint.sh
RUN NEXT_PUBLIC_ENTRYPOINT=/__ENTRYPOINT__ npm run build
ENV NEXT_PUBLIC_ENTRYPOINT=""
CMD npm run start -- --port $PORT
