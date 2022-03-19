import 'dotenv/config';
import { setOnMessage } from './logParser.js';
import { Client, Intents } from 'discord.js';

const prefix = '!';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready', () => {
    console.log('discord connection ready');
});

client.on('messageCreate', async (message) => {
    if (message.content.charAt(0) != prefix) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (!command || message.author.bot) return;
    if(message.author !== client.user 
        //with the below line commented it should respond to anyone
        && message.author.id !== process.env.OWNERID
    ) return;

    if (command === 'ping') {
        message.channel.send('pong!');
    }

});

setOnMessage((message) => {
    // console.log(message);

    const nameIndex = message.search(/<\w+>/);
    if (nameIndex === -1) return;
    let tmp = message.substr(nameIndex);
    tmp = tmp.split('> ');
    const name = tmp.shift().substr(1);
    const clippedMessage = tmp.join('> ');
    console.log(`${name} => ${clippedMessage}`)
});

client.login(process.env.TOKEN);