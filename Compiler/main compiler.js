class Compiler {
    constructor() {
        this.compile = (code, varCarry) => {
            // code = this.removeComments(code);
            const Vstrings = this.getStrings(code);
            const Vdec = this.getDeclerations(code, Vstrings, varCarry ? varCarry.map(e => e.name) : false, ["declare"]);
            const vars = Vdec.vars;
            const varCompiled = this.insertVariableFunctions(code, vars);
            const Fstrings = this.getStrings(varCompiled);
            const Sdec = this.getDeclerations(varCompiled, Fstrings, false, ["script"]);
            const scripts = Sdec.scripts;
            const funcCompiled = this.insertScriptFunctions(varCompiled, scripts);
            return {
                compiled: funcCompiled,
                vars: vars,
                scripts: scripts
            }
        }
        return this;
    }
    // removeComments(code) {
    //     const regex = /((["'`])(?:\\[\s\S]|.)*?\2|\/(?![*\/])(?:\\.|\[(?:\\.|.)\]|.)*?\/)|\/\/.*?$|\/\*[\s\S]*?\*\//gm;
    //     return code.replaceAll(regex, '');
    //   }

    getStrings(t) {
        const strings = [];
        let stringType = null;
        let string = {};
        let escapedChar = null;
        for (let i = 0; i < t.length; i++) {
            if (t[i - 1] == "\\") {
                escapedChar = t[i];
            } else {
                escapedChar = null;
            }
            if ((stringType == null ? ["\"", "'", "`"] : [stringType]).includes(t[i]) || (stringType == null ? ['/*', '//'].includes(t[i] + t[i+1]) : [stringType.replace('/*', '*/').replace('//', '\n')].includes(t[i - 1] + t[i]))) {
                if (stringType == null) {
                    stringType = t[i];
                    string.startIndex = i;
                } else {
                    if (escapedChar !== stringType) {
                        string.string = t.substring(string.startIndex, i + 1);
                        strings.push({ ...string});
                        string = {};
                        stringType = null;
                    }
                }
            }
        }
        return strings;
    }

    convertToStringList(strings) {
        const stringList = [];
        for (let i of strings) {
            for (let j in i.string) {
                stringList.push(i.startIndex + parseInt(j));
            }
        }
        return stringList.sort();
    }

    getDeclerations(code, strings, v, d) {
        const vars = v ? v.map(e => { return { name: e, declarationIndex: null, declarationType: null, occurences: [], global: true } }) : [];
        const scripts = [];
        const stringList = this.convertToStringList(strings);
        const clauseEnds = " (){}[].,=+|&-*^%;\n\r";
        const variableDeclerations = d;
        for (let i = 0; i < code.length; i++) {
            const inString = stringList.includes(i);
            if (!inString) {
                const validVars = vars.map(e => e.name).filter(e => e.startsWith(code[i]));
                if (validVars.length > 0) {
                    for (let j of clauseEnds) {
                        const end = code.indexOf(j, i);
                        const clip = code.substring(i, end);
                        if (validVars.includes(clip) && code[i-1] != '.') {

                            vars[vars.map(e => e.name).indexOf(clip)].occurences.push(i);
                            i += clip.length - 1;
                            break;
                        }
                    }
                }
                for (let j of variableDeclerations) {
                    if (code.substring(i, i + j.length) == j) {
                        const varStart = i + j.length;
                        let varEnd = varStart;
                        if (j == "script") {
                            let curlyBrackets = 1;
                            let firstIndex = null;
                            for (let k = 0; k < code.length - varEnd && curlyBrackets > 0; k++) {
                                if (!stringList.includes(varStart + k)) {
                                    if (code[varStart + k] == "{") {
                                        curlyBrackets++;
                                        if (firstIndex == null) {
                                            curlyBrackets--;
                                            firstIndex = varStart + k;
                                        }
                                    } else if (code[varStart + k] == "}") {
                                        curlyBrackets--;
                                        if (curlyBrackets < 1) varEnd += k
                                    }
                                }
                            }
                            if (varEnd > varStart) {
                                scripts.push({
                                    declarationIndex: varStart - j.length,
                                    functionIndex: firstIndex,
                                    declarationEnd: varEnd
                                });
                            }
                        } else {
                            for (let k = 1; k < 256; k++) {
                                if (clauseEnds.includes(code[varStart + k])) {
                                    varEnd += k;
                                    break;
                                }
                            }
                            if (varEnd > varStart) {
                                vars.push({
                                    name: code.substring(varStart + 1, varEnd),
                                    declarationIndex: i,
                                    declarationType: j,
                                    occurences: [i + j.length + 1],
                                    global: j == "declare"
                                });
                                i = varEnd;
                                break;
                            }
                        }
                    }
                }
            }
        }
        return { vars: vars, scripts: scripts };
    }

    charMapSubstring(charMap, begin, end, append) {
        const chars = charMap.map(e => e.char);
        const indexes = charMap.map((e, i) => { return { o: e.origIndex, i: i } });
        let results = [];
        for (let i = (begin == 0 ? 0 : indexes.filter(e => e.o == begin)[0].i); i < (end == undefined ? chars.length : indexes.filter(e => e.o == end)[0].i); i++) {
            results.push({
                char: chars[i],
                origIndex: indexes[i].o
            });
        }
        if (append) {
            for (let i of append) {
                results.push({
                    char: i,
                    origIndex: null
                });
            }
        }
        return results;

    }

    insertVariableFunctions(code, declarations) {
        let charMap = code.split("").map((c, i) => { return { char: c, origIndex: i } });
        declarations = declarations.map(e => { e.occurences = e.occurences.filter((f, i) => { return e.occurences.indexOf(f) == i && i !== 0; }); return e; });
        for (let i of declarations) {
            if (i.declarationIndex !== null) charMap = this.charMapSubstring(charMap, 0, i.declarationIndex, `const`).concat(this.charMapSubstring(charMap, i.declarationIndex + i.declarationType.length));
            for (let j of i.occurences) {
                charMap = this.charMapSubstring(charMap, 0, j, `(await ${i.name}())`).concat(this.charMapSubstring(charMap, j + i.name.length));
            }
        }
        return charMap.map(e => e.char).join("");

    }

    insertScriptFunctions(code, declarations) {
        let charMap = code.split("").map((c, i) => { return { char: c, origIndex: i } });
        for (let i of declarations) {
            charMap = this.charMapSubstring(charMap, 0, i.declarationIndex, `()=>new Promise(async resolve=>`).concat(this.charMapSubstring(charMap, i.functionIndex, i.declarationEnd, `;resolve()})`)).concat(this.charMapSubstring(charMap, i.declarationEnd + 1));
        }
        return charMap.map(e => e.char).join("");
    }
}

module.exports = new Compiler();