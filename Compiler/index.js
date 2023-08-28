const prompt = require("prompt-sync")({ sigint: true });
const fs = require('fs');
const mainCompiler = require('./main compiler.js');
async function compile(path, target) {
    console.log('Reading File...');
    const fileRead = await fs.promises.readFile(path, { encoding: 'utf8' });
    console.log('Compiling Script...')
    const compiled = mainCompiler.compile(fileRead);
    console.log('Loading Runtime...');
    const runtime = await fs.promises.readFile('runtime.js', { encoding: 'utf8' });
    const runtimed = runtime.replace('// runtime', compiled.compiled);
    console.log('Writing To target...');
    await fs.promises.writeFile(target, runtimed);

}

if (process.argv[2] && process.argv[3]) {
    compile(process.argv[2], process.argv[2]);
} else if (process.argv[2]) {
    const n = process.argv[2].split('.');
    n.pop();
    compile(process.argv[2], n.join('.') + '.js');
} else {
    const n = process.argv[2].split('.');
    n.pop();
    compile(prompt('Enter script path: '), prompt('Enter target path: ') || process.argv[2], n.join('.') + '.js');
}