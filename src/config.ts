import { TargetLanguageCode } from "deepl-node";
import { readFile } from "fs/promises";
import { load } from "js-yaml";

interface ConfigData {
    configuration: {
        allowed_users: number[];
        lang_to_translate: TargetLanguageCode;
        gibberish_model: boolean;
        min_msg_length: number;
        message: string;
    };
}


export const yaml = load(await readFile("config.yml", "utf8")) as ConfigData;
