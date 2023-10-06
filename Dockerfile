FROM node:20

COPY package.json ./
COPY src ./
COPY . ./

RUN npm install

CMD ["ts-node-esm", "index.ts"]
