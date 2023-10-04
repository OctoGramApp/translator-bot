# translator-bot
A simple bot to translate messages in a single or multiple telegram groups.

## Commands (admin only)
`/allow` Enable the group for translating messages.
`/deny` The bot will not translate messages anymore in this group.

## Running
### Without docker

To install dependencies:

```bash
npm install
```

To run:

```bash
TOKEN='BOT_TOKEN_HERE' DEEPL='DEEPL_TOKEN_HERE' npm run bot
```

### Docker

To build:

```bash
sudo docker build -t translator-bot .
```

To run:

```bash
sudo docker run -e TOKEN='BOT_TOKEN_HERE' -e DEEPL='DEEPL_TOKEN_HERE' translator-bot
```