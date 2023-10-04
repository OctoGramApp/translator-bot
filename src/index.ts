import { Bot } from 'grammy';
import { Translator } from "deepl-node";
import { loadModel, testString } from "./gibberish.js";
import { readFileSync, writeFile, existsSync } from "fs";
import { config } from "dotenv";

config();

let allowed_groups: number[] = [];

if (existsSync("groups.txt")) {
    const file = readFileSync("groups.txt");
    if (file.length != 0) {
        const text = file.toString();
        allowed_groups = text.split("\n").map((x) => parseInt(x));
    }
}

const bot = new Bot(process.env.TOKEN!);
const translator = new Translator(process.env.DEEPL!);
const translated_messages = new Map<string, string>();

const layout = bot.chatType(["group", "supergroup"])
    .filter(async (ctx) => {
        const user = await ctx.getAuthor();
        return user.status === "creator" || user.status === "administrator";
    });
layout.command("allow", async (ctx) => {
    if (allowed_groups.includes(ctx.chat.id)) {
        await ctx.reply("This group is already allowed.");
        return;
    }
    allowed_groups.push(ctx.chat.id);
    await ctx.reply("This group is now allowed.");
    writeFile("groups.txt", allowed_groups.join("\n"), (err) => {
        if (err) {
            console.error(err);
        }
    });
});
layout.command("deny", async (ctx) => {
    if (!allowed_groups.includes(ctx.chat.id)) {
        await ctx.reply("This group is already denied.");
        return;
    }
    allowed_groups.splice(allowed_groups.indexOf(ctx.chat.id), 1);
    await ctx.reply("This group is now denied.");
    writeFile("groups.txt", allowed_groups.join("\n"), (err) => {
        if (err) {
            console.error(err);
        }
    });
});


bot.on("message", async (ctx) => {
    if (!allowed_groups.includes(ctx.chat.id)) {
        return;
    }
    if (ctx.message?.text == undefined) {
        return;
    }
    if (ctx.message?.text.startsWith("/")) {
        return;
    }
    const message = ctx.message.text;
    if (message.length < 15) {
        return;
    }
    if (!testString(message)) {
        return;
    }
    if (translated_messages.has(message)) {
        await ctx.reply(translated_messages.get(message)!, { reply_to_message_id: ctx.message.message_id });
        return;
    }
    translator
        .translateText(message, null, 'en-US')
        .then((result) => {
            if (result.detectedSourceLang == "en") {
                return;
            }
            const toSend = "Translated from " + result.detectedSourceLang + " to en-US" + ":\n" + result.text;
            ctx.reply(toSend, { reply_to_message_id: ctx.message.message_id });
            translated_messages.set(message, result.text);
        })
        .catch((error) => {
            console.error(error);
        });
});

await loadModel("gib_model.json");
console.log("Logging in");
await bot.start();