
const accepted_chars = 'abcdefghijklmnopqrstuvwxyz ';
const pos = [...accepted_chars].reduce((acc: { [char: string]: number }, char, idx) => {
    acc[char] = idx;
    return acc;
}, {});
let model: { mat: number[][], thresh: number };

function normalize(line: string) {
    return [...line.toLowerCase()].filter(c => c in pos);
}

function* ngram(n: number, l: string) {
    const filtered = normalize(l);
    for (let start = 0; start < filtered.length - n + 1; ++start) {
        yield filtered.slice(start, start + n).join('');
    }
}

function avg_transition_prob(l: string, log_prob_mat: number[][]): number {
    let log_prob = 0.0;
    let transition_ct = 0;

    for (const [a, b] of ngram(2, l)) {
        log_prob += log_prob_mat[pos[a]][pos[b]];
        transition_ct += 1;
    }

    return Math.exp(log_prob / (transition_ct || 1));
}


export async function loadModel(pathToModel: string) {
    const file = Bun.file(pathToModel);
    model = await file.text().then(JSON.parse);
}

export function testString(str: string): boolean {
    return avg_transition_prob(str, model['mat']) > model['thresh'];
}