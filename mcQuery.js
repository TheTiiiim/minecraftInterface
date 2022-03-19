import { promisify } from 'util';
import { exec as _exec } from 'child_process';

const exec = promisify(_exec);

async function mcQuery(query) {
    const { stdout, stderr } = await exec(query);
    console.error(stderr);
    return stdout;
}

export async function listPlayers() {
    let response =  await mcQuery(`mcrcon -p ${process.env.RCON_PW} list`);
    return response.substring(0, response.length - 5);
}
