class Sequence {
    constructor(...array) {
        this.length = 0;
        this.highestValue = null;
        this.highestIndex = -1;
        this.lowestValue = null;
        this.lowestIndex = -1;
        if (array == undefined) {
            this.#array = [];
        } else {
            if (!array.forEach) throw ('Argument is not of type array');
            if(array[0].forEach) array = array[0];
            this.#array = array.map((n, i) => {
                const num = new Number(n);
                if(num > this.highestValue || this.highestValue == undefined) (this.highestValue = n, this.highestIndex = i);
                if(num < this.lowestValue || this.lowestValue == undefined) (this.lowestValue = n, this.lowestIndex = i);
                return num;
            });
            this.length = this.#array.length;
        }

    }
    #array;

    add(...values) {
        this.#array = this.#array.concat(values.map(n => new Number(n)));
        this.length += values.length;
    }
    delete(index) {
        this.#array.splice(index, 1);
        this.length--;
    }

    replace(index, value) {
        this.#array[index] = new Number(value);
    }

    insert(index, value) {
        this.#array.splice(index, 0, new Number(value));
        this.length++;
    }

    at(index) {
        return new Number(this.#array.at(index));
    }

    toArray() {
        return structuredClone(this.#array);
    }

    toString(type) {
        switch (type.toLowerCase()) {
            case 'csv':
                return this.#array.join(',');
            case 'tsv':
                return this.#array.join('\t');
            default:
                return this.#array.join(', ');
        }
    }
    forecastNext() {
        if (this.#array.length < 3) throw ('Sequence must have at least 3 objects.');
        function linearGrowthRate(l1, l2) {
            return l2 + (l2 - l1);
        }

        function exponentialGrowthRate(e1, e2) {
            return e2 * e2 / e1;
        }

        const linearDistance = Math.abs(linearGrowthRate(this.#array.at(-3), this.#array.at(-2)) - this.#array.at(-1));
        const exponentialDistance = Math.abs(exponentialGrowthRate(this.#array.at(-3), this.#array.at(-2)) - this.#array.at(-1));
        if (linearDistance <= exponentialDistance) return new Number(linearGrowthRate(this.#array.at(-2), this.#array.at(-1)));
        if (exponentialDistance <= linearDistance) return new Number(exponentialGrowthRate(this.#array.at(-2), this.#array.at(-1)));
    }

    forecastPrevious() {
        if (this.#array.length < 3) throw ('Sequence must have at least 3 objects.');
        function linearDecayRate(l1, l2) {
            return l1 - (l2 - l1);
        }

        function exponentialDecayRate(e1, e2) {
            return e1 / (e2 / e1);
        }

        const linearDistance = Math.abs(linearDecayRate(this.#array.at(1), this.#array.at(2)) - this.#array.at(0));
        const exponentialDistance = Math.abs(exponentialDecayRate(this.#array.at(1), this.#array.at(2)) - this.#array.at(0));
        if (linearDistance <= exponentialDistance) return new Number(linearDecayRate(this.#array.at(0), this.#array.at(1)));
        if (exponentialDistance <= linearDistance) return new Number(exponentialDecayRate(this.#array.at(0), this.#array.at(1)));
    }
}