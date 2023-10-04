FROM oven/bun:latest

COPY package.json ./
COPY bun.lockb ./
COPY src ./
COPY . ./

RUN bun install

CMD ["bun", "run", "index.ts"]