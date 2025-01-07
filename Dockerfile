FROM node:22-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3000 9229

CMD ["npm", "run", "dev"]
