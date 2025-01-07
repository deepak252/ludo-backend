FROM node:22-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 9229

# CMD ["npm", "run", "dev"]
CMD ["npm", "run", "watch"]
