import { exec as _exec } from 'child_process';

let dataCache = '';

let onMessage = (message) => {};


function doSomething(data) {
    onMessage(data.MESSAGE);
}

let thread = _exec(`journalctl -o json-seq --boot --lines=0 -fau ${process.env.SERVICE}`);
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

thread.on('spawn', () => {
    console.log('journal watching process started');
});

thread.on('exit', () => {
    console.log('journal watching process exited');
});

export function setOnMessage(func = () => {}) {onMessage = func;}