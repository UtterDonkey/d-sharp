class Task {

    constructor(func) {
        this.#startTime = new Date();
        this.#lastProgress = new Date();
        this.progress = 0;
        func(this.#updateProgress)
            .then((value) => { this.#completeEvents.forEach(e => e(value)); this.#endEvents.forEach(e => e(value)) })
            .catch((value) => { this.#failEvents.forEach(e => e(value)); this.#endEvents.forEach(e => e(value)) });
    }
    #progressEvents = [];
    #completeEvents = [];
    #failEvents = [];
    #endEvents = [];
    #lastProgress;
    #timeRemaining;
    #startTime;
    timeRemaining() {
        if (this.progress >= 1) return 0;
        const elapsed = new Date() - this.#startTime;
        const delta = new Date() - this.#lastProgress
        if (this.#timeRemaining === null) {
            this.#timeRemaining = 1 / this.progress * elapsed;
        } else {
            // this.#timeRemaining = 1/this.progress*(elapsed-delta)-elapsed/*((1/newProgress*elapsed)+(/*this.timeRemaining-new Date()+this.#lastProgress1/newProgress*elapsed))/2;*/
            function min(...values) {
                let r = values[0];
                values.forEach(n => { if (n < r && !isNaN(n)) r = n });
                return r;
            }
            this.#timeRemaining = min((elapsed - delta - elapsed * this.progress) / this.progress, this.#timeRemaining);
        }
        return this.#timeRemaining;
    }
    #updateProgress = (newProgress) => {
        this.progress = newProgress;
        const elapsed = new Date() - this.#startTime;
        this.#lastProgress = new Date();
        this.#progressEvents.forEach(e => e({ progress: newProgress, timeElapsed: elapsed, timeRemaining: this.timeRemaining() }));
    }
    on(event, fn) {
        switch (event) {
            case 'progressUpdate':
                this.#progressEvents.push(fn);
                break;
            case 'complete':
                this.#completeEvents.push(fn);
                break;

            case 'fail':
                this.#failEvents.push(fn);
                break;
            case 'end':
                this.#endEvents.push(fn);
                break;

        }
    }

}