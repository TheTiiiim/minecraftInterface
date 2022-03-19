import 'dotenv/config';
import { setOnMessage } from './logParser.js';

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
