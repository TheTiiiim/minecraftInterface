import 'dotenv/config';
import { exec as _exec } from 'child_process';

let dataCache = '';

function doSomething(data) {
    console.log(`Message: ${data.MESSAGE}`);
    // emit message to be processed by other parts of application
}

let thread = _exec(`journalctl -o json-seq --boot --lines=all -au ${process.env.SERVICE}`);
thread.stderr.on('data', (_data) => {
    console.log(_data);
});

thread.stdout.on('data', (_data) => {
    _data = _data.split('\n');
    
    _data.forEach((item, index) => {
        if (item === '') return;
        if (index === 0 && dataCache != '') {
            item = dataCache + item;
            dataCache = '';
        }
        let data;
        try {
            data = JSON.parse(item.replace(/[^ -~]+/g, ''));
        } catch (err) {
            // journalctl will start a JSON object in one glob and finish it in the next, making this neccessary
            if (err.message === 'Unexpected end of JSON input') {
                dataCache = item;
                // console.log('added unfinished message to cache');
                return;
            }
            console.error(err);
            console.log(item);
            return;
        }
        doSomething(data);
    });
});

thread.on('exit', () => {
    console.log('journal watching process exited');
});

thread.on('spawn', () => {
    console.log('journal watching process started');
});
