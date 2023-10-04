FROM oven/bun:latest

COPY package.json ./
COPY src ./
COPY . ./

RUN bun install

CMD ["npm", "run", "bot"]
