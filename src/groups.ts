import { existsSync, readFileSync, writeFile } from "fs";

const allowed_groups: number[] = getAllowedGroups();

function getAllowedGroups(): number[] {
    if (existsSync("groups.txt")) {
        const file = readFileSync("groups.txt");
        if (file.length != 0) {
            const text = file.toString();
            return text.split("\n").map((x) => parseInt(x));
        }
    }
    return [];
}

export function updateGroupStatus(allow: boolean, id: number): boolean {
    if (allow) {
        if (allowed_groups.includes(id)) {
            return false;
        }
        allowed_groups.push(id);
    } else {
        if (!allowed_groups.includes(id)) {
            return false;
        }
        allowed_groups.splice(allowed_groups.indexOf(id), 1);
    }
    writeFile("groups.txt", allowed_groups.join("\n"), (err) => {
        if (err) {
            console.error(err);
        }
    });
    return true;
}

export function isAllowed(id: number): boolean {
    return allowed_groups.includes(id);
}
