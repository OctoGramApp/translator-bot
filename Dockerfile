FROM node:20

COPY package.json ./
COPY src ./
COPY . ./

RUN npm install

CMD ["npm", "run", "bot"]
