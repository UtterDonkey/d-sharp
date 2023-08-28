class Job {
    constructor(...promises) {
        this.tasks = promises.map((promise, index) => {
            return {
                promise: promise,
                index: index,
                fulfilled: false,
                resolved: false,
                resolvedValue: null,
                rejected: false,
                rejectedValue: null,
                status: 'pending',
                startTime: new Date(),
                endTime: null
            }
        });
        this.tasksFulfilled = 0;
        this.tasksResolved = 0;
        this.tasksRejected = 0;
        this.tasks.forEach(task => {
            task.promise.then(value => {
                task.fulfilled = true;
                task.resolved = true;
                task.resolvedValue = value;
                task.status = 'fulfulled';
                task.endTime = new Date();
                this.tasksFulfilled++;
                this.tasksResolved++;
                this.resolveEvent(task);
                this.fulfillEvent(task);
            }).catch(value => {
                task.fulfilled = true;
                task.rejected = true;
                task.rejectedValue = value;
                task.status = 'rejected';
                task.endTime = new Date();
                this.tasksFulfilled++;
                this.tasksRejected++;
                this.rejectEvent(task);
                this.fulfillEvent(task);
            });
        });
    };
    #allfulfilled;
    #allresolved;
    #allrejected;
    promises = {
        allfulfilled: new Promise(resolve => this.#allfulfilled = resolve),
        allresolved: new Promise(resolve => this.#allresolved = resolve),
        allrejected: new Promise(resolve => this.#allrejected = resolve)
    };
    #fulfillEvents = [];
    #resolveEvents = [];
    #rejectEvents = [];

    on(event, fn) {
        switch (event) {
            case 'fulfill':
                this.#fulfillEvents.push({
                    type: 'any',
                    callback: fn
                });
                break;
            case 'resolve':
                this.#resolveEvents.push({
                    type: 'any',
                    callback: fn
                });
                break;
            case 'reject':
                this.#rejectEvents.push({
                    type: 'any',
                    callback: fn
                });
                break;
            case 'fulfillAll':
                this.#fulfillEvents.push({
                    type: 'all',
                    callback: fn
                });
                break;
            case 'resolveAll':
                this.#resolveEvents.push({
                    type: 'all',
                    callback: fn
                });
                break;
            case 'rejectAll':
                this.#rejectEvents.push({
                    type: 'all',
                    callback: fn
                });
                break;
        }
    };
    fulfillEvent(task) {
        const allDone = this.tasksFulfilled == this.tasks.length;
        if (allDone) this.#allfulfilled(this.tasks);
        this.#fulfillEvents.forEach(evt => {
            if (evt.type == 'any') {
                evt.callback(task);
            } else if (evt.type == 'all' && allDone) {
                evt.callback(this.tasks);
            }
        });
    };

    resolveEvent(task) {
        const allDone = this.tasksResolved == this.tasks.length;
        if (allDone) this.#allresolved(this.tasks.filter(task => task.resolved));
        this.#resolveEvents.forEach(evt => {
            if (evt.type == 'any') {
                evt.callback(task);
            } else if (evt.type == 'all' && allDone) {
                evt.callback(this.tasks.filter(task => task.resolved));
            }
        });
    };

    rejectEvent(task) {
        const allDone = this.tasksRejected == this.tasks.length;
        if (allDone) this.#allrejected(this.tasks.filter(task => task.rejected));
        this.#rejectEvents.forEach(evt => {
            if (evt.type == 'any') {
                evt.callback(task);
            } else if (evt.type == 'all' && allDone) {
                evt.callback(this.tasks.filter(task => task.rejected));
            }
        });
    };


}