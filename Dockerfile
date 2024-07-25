FROM node:21.7.3-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npx prisma generate 

RUN npm run build

EXPOSE 3333

ENTRYPOINT [ "node", "dist/main.js" ]

