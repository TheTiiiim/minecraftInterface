import 'dotenv/config';
import { setOnMessage } from './logParser.js';
import { listPlayers } from './mcQuery.js';
import { Client, Intents } from 'discord.js';

const prefix = '!';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
let guild;
let channel;

client.on('ready', async () => {
    console.log('discord connection ready');

    if (process.env.GUILD && process.env.CHANNEL) {
        guild = await client.guilds.fetch(process.env.GUILD);
        channel = await guild.channels.fetch(process.env.CHANNEL);
    }
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

    switch (command) {
        case 'ping':
            message.channel.send('pong!');
            break;
        case 'list':
            message.channel.send(await listPlayers());
            break;
        case 'setmcchannel':
            if (!args[0]) break;
            try {
                channel = await message.guild.channels.fetch(args[0]);
                guild = message.guild;
                message.channel.send(`Set channel to "${args[0]}"`);
            } catch (err) {
                message.channel.send(`Could not set channel to "${args[0]}"`);
            }
            // message.channel.send(args[0]);
            break;
    }
});

function mcParseChat(message) {
    const nameIndex = message.search(/<\w+>/);
    if (nameIndex === -1) return;
    let tmp = message.substr(nameIndex);
    tmp = tmp.split('> ');
    const user = tmp.shift().substr(1);
    const clippedMessage = tmp.join('> ');
    return {user, message: clippedMessage};
}

setOnMessage((message) => {
    let chatMessage = mcParseChat(message);

    if (chatMessage && channel) {
        channel.send(`(Minecraft) ${chatMessage.user}: ${chatMessage.message}`);
        return;
    }

    console.log(message);
});

client.login(process.env.TOKEN);