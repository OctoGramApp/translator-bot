import { Bot, Context } from 'grammy';
import { Translator } from "deepl-node";
import { loadModel, testString } from "./gibberish.js";
import { updateGroupStatus, isAllowed } from "./groups.js";
import { config } from "dotenv";
import { yaml } from './config.ts';
import { format } from 'util';

config();

async function isUserAllowed(ctx: Context): Promise<boolean> {
    const id = ctx.from!.id;
    if (yaml.configuration.allowed_users.length == 0) {
        const isAdmin = await ctx.getChatMember(id).then((member) => member.status == "creator");
    }
    return yaml.configuration.allowed_users.includes(id);
}

const bot = new Bot(process.env.TOKEN!);
const translator = new Translator(process.env.DEEPL!);
const translated_messages = new Map<string, string>();

const layout = bot.chatType(["group", "supergroup"]).filter(async (ctx) => await isUserAllowed(ctx));
layout.command("allow", async (ctx) => {
    if (!updateGroupStatus(true, ctx.chat.id)) {
        await ctx.reply("This group is already allowed.");
        return;
    }
    await ctx.reply("This group is now allowed.");
});
layout.command("deny", async (ctx) => {
    if (!updateGroupStatus(true, ctx.chat.id)) {
        await ctx.reply("This group is already denied.");
        return;
    }
    await ctx.reply("This group is now denied.");
});


bot.on("message", async (ctx) => {
    if (!isAllowed(ctx.chat.id)) {
        return;
    }
    if (ctx.message?.text == undefined) {
        return;
    }
    const message = ctx.message.text;
    if (message.startsWith("/")) {
        return;
    }
    // if (message.split(" ").every((x) => x.startsWith("@"))) {
    //     return;
    // }
    if (message.length < yaml.configuration.min_msg_length) {
        return;
    }
    if (yaml.configuration.gibberish_model && !testString(message)) {
        return;
    }
    if (translated_messages.has(message)) {
        await ctx.reply(translated_messages.get(message)!, { reply_to_message_id: ctx.message.message_id });
        return;
    }
    translator
        .translateText(message, null, yaml.configuration.lang_to_translate)
        .then((result) => {
            if (result.detectedSourceLang == "en") {
                return;
            }
            const toSend = format(yaml.configuration.message,
                result.detectedSourceLang,
                yaml.configuration.lang_to_translate,
                result.text
            );
            ctx.reply(toSend, { reply_to_message_id: ctx.message.message_id });
            translated_messages.set(message, result.text);
        })
        .catch((error) => {
            console.error(error);
        });
});

if (yaml.configuration.gibberish_model) {
    console.log("Loading model");
    await loadModel("gib_model.json");
}
console.log("Logging in");
await bot.start();