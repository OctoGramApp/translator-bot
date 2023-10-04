import { Bot } from "grammy";
import { Translator } from "deepl-node";
import { loadModel, testString } from "./gibberish";

const file = Bun.file("groups.txt");
let allowed_groups: number[] = [];
if (file.size != 0) {
    const text = await file.text();
    allowed_groups = text.split("\n").map((x) => parseInt(x));
}
const bot = new Bot(process.env.TOKEN!);
const translator = new Translator(process.env.DEEPL!);


const layout = bot.chatType(["group", "supergroup"])
    .filter(async (ctx) => {
        const user = await ctx.getAuthor();
        return user.status === "creator" || user.status === "administrator";
    });
layout.command("allow", (ctx) => {
    if (allowed_groups.includes(ctx.chat.id)) {
        ctx.reply("This group is already allowed.");
        return;
    }
    allowed_groups.push(ctx.chat.id);
    ctx.reply("This group is now allowed.");
    Bun.write("groups.txt", allowed_groups.join("\n"));
});
layout.command("deny", (ctx) => {
    if (!allowed_groups.includes(ctx.chat.id)) {
        ctx.reply("This group is already denied.");
        return;
    }
    allowed_groups.splice(allowed_groups.indexOf(ctx.chat.id), 1);
    ctx.reply("This group is now denied.");
    Bun.write("groups.txt", allowed_groups.join("\n"));
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
    translator
        .translateText(message, null, 'en-US')
        .then((result) => {
            if (result.detectedSourceLang == "en") {
                return;
            }
            const toSend = "Translated from " + result.detectedSourceLang + " to en-US" + ":\n" + result.text;
            ctx.reply(toSend, { reply_to_message_id: ctx.message.message_id });
        })
        .catch((error) => {
            console.error(error);
        });
});

await loadModel("gib_model.json");
console.log("Logging in");
await bot.start();