const prompt = require("prompt-sync")({ sigint: true });
const fs = require('fs');
const mainCompiler = require('./main compiler.js');
async function compile(path){
    console.log('Compiling: ' + path);
    const fileRead = await fs.promises.readFile(path, {encoding: 'utf8'});
    const compiled = mainCompiler.compile(fileRead);
    console.log(compiled.compiled);
}

if(process.argv[2]){
    compile(process.argv[2]);
}else{
    compile(prompt('Enter script path: '));
}