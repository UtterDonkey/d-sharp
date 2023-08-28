(async () => {
    const Maths = Math;
    Math.PISS = () => {
        return Maths.PI + ((Maths.random() - 0.5) * Maths.random() * Maths.random() * Maths.random())
    };

    Math.gibberish = () => {
        return Maths.random();
    };

    Math.numerate = () => {
        return function (n) {
            return isNaN(n) || n === null || n === undefined ? 0 : n;
        }
    }

    console.print = () => {
        return console.log;
    };

    const PI = Math.PI;
    const pi = Math.PI;

    const range = function (start, end) {
        const arr = [];
        for (let i = start; i <= end; i++) {
            arr.push(i);
        }
        return arr;
    }

    const len = function (string) {
        return string.length;
    }

    const print = function (...a) {
        console.log(...a);
    }

    const str = function (a) {
        return a.toString();
    }

    const int = function (a) {
        return parseInt(a);
    }

    const float = function (a) {
        return parseFloat(a);
    }

    const type = function (a) {
        return typeof a;
    }

    const list = function (a) {
        return Array.from(a);
    }

    const bool = function (a) {
        return !!a;
    }

    const True = true;
    const False = false;

    Object.getOwnPropertyNames(Math).forEach(e => {
        if (!e in window) window.__defineGetter__(e, function () {
            return Math[e];
        });
    });

    String.prototype.toInt = function () { return parseInt(this) };
    String.prototype.toFloat = function () { return parseFloat(this) };
    String.prototype.toNumber = function () { return +(new Number(this)) };
    Number.prototype.isMultipleOf = function (n) { return this % n === 0 };
    Number.prototype.isEven, function () {
        return this % 2 === 0;
    }
    Number.prototype.length, function () {
        return this.toString().length;
    };
    Number.prototype.isRational = function () {
        if (!Number.isFinite(+this)) {
            return true;
        }

        if (Number.isInteger(+this)) {
            return true;
        }

        const numerator = Math.round(+this * 1e15);
        const denominator = 1e15;
        const gcd = function (a, b) {
            if (b === 0) {
                return a;
            }
            return gcd(b, a % b);
        };
        return gcd(numerator, denominator) !== 1;
    }

    NodeList.prototype.array = function () {
        return Array.from(this)
    };

    // runtime
    const Deval = eval;
    class DSharp{
        constructor(){
            return this;
        }

        eval(...params){
            return Deval(...params);
        }
    }
    return new DSharp();
})();