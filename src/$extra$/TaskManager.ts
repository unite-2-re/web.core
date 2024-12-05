//
type FX = ((a: any)=>any);

//
export class TaskManager {
    #tasks: any[] = [];
    #events = new Map<string, FX[]>([]);

    //
    constructor(tasks = []) {
        this.#tasks  = tasks || [];
        this.#events = new Map<string, FX[]>([]);

        //
        const hist = (_) => {
            this.focus(location.hash);
        };

        //
        addEventListener("hashchange", hist);
        addEventListener("popstate", hist);

        //
        this.focus(location.hash);
    }

    //
    trigger(name, ev = {}) {
        {
            const events: FX[] = this.#events.get(name) || [];
            events.forEach((cb)=>cb(ev));
        };
        {
            const events: FX[] = this.#events.get("*") || [];
            events.forEach((cb)=>cb(ev));
        };
        return this;
    }

    //
    on(name, cb) {
        const events: FX[] = this.#events.get(name) || [];
        events.push(cb);
        this.#events.set(name, events);
        return this;
    }

    //
    get(taskId: string) {
        const index = this.tasks.findIndex((t)=>t.id == taskId);
        if (index >= 0) {
            return this.tasks[index];
        }
        return null;
    }

    //
    get tasks() {
        return this.#tasks;
    }

    //
    getTasks() {
        return this.#tasks;
    }

    //
    getOnFocus() {
        return this.#tasks.findLast((t)=>t.active);
    }

    //
    isActive(taskId: string) {
        const index = this.#tasks.findLastIndex((t)=>t.active && t.id == taskId);
        if (index >= 0) { return true; };
        return false;
    }

    //
    inFocus(taskId: string) {
        const task = this.#tasks.findLast((t)=>t.active);
        if (task?.id == taskId) { return true; };
        return false;
    }

    //
    focus(taskId: string) {
        this.activate(taskId);

        //
        const index = this.tasks.findIndex((t)=>t.id == taskId);
        if (index >= 0 && index < (this.tasks.length-1)) {
            const task = this.tasks[index];
            this.tasks.splice(index, 1);
            this.tasks.push(task);
            this.trigger("focus", {task, self: this, oldIndex: index, index: (this.tasks.length-1)});
        }

        //
        if (location?.hash?.trim?.() != taskId?.trim?.() && taskId)
            {
                const oldHash = location.hash;
                history.replaceState(null, "", location.hash = taskId || oldHash);
                window.dispatchEvent(new HashChangeEvent("hashchange", {
                    oldURL: oldHash,
                    newURL: taskId || oldHash
                }));
            };

        //
        return this;
    }

    //
    deactivate(taskId: string) {
        const index = this.tasks.findIndex((t)=>t.id == taskId);
        if (index >= 0) {
            const task = this.tasks[index];
            if (task?.active) {
                task.active = false;
                this.trigger("deactivate", {task, self: this, index});
            }
        }

        //
        if (location?.hash?.trim?.() == taskId?.trim?.() && taskId)
            {
                const oldHash = location.hash;
                history.replaceState(null, "", location.hash = this.getOnFocus()?.id || "");
                window.dispatchEvent(new HashChangeEvent("hashchange", {
                    oldURL: oldHash,
                    newURL: "#"
                }));
            };

        //
        return this;
    }

    //
    activate(taskId: string) {
        const index = this.tasks.findIndex((t)=>t?.id == taskId);
        if (index >= 0) {
            const task = this.tasks[index];
            if (!task?.active) {
                task.active = true;
                this.trigger("activate", {task, self: this, index});
            }
        }
        return this;
    }

    //
    addTasks(tasks: any = []) {
        for (const task of (tasks?.value ?? tasks)) {
            this.addTask(task || {}, false);
        }
        return this;
    }

    //
    addTask(task, doFocus = true) {
        const index = this.tasks.findIndex((t)=>(t == task || t?.id == task.id));
        const last = this.tasks.length;

        //
        if (index < 0) {
            task.order = last;
            this.tasks.push(task);
            this.trigger("addTask", {task, self: this, index: last});
        } else {
            const exist = this.tasks[index];
            if (exist != task) {
                Object.assign(exist, task);
            }
        }

        //
        if (doFocus || location?.hash?.trim?.() == task?.id?.trim?.()) {
            this.focus(task?.id);
        }

        //
        return this;
    }

    //
    removeTask(taskId: string) {
        const index = this.tasks.findIndex((t)=>t?.id == taskId);
        if (index >= 0) {
            const task = this.tasks[index];
            this.tasks.splice(index, 1);
            this.trigger("removeTask", {task, self: this, index: -1, oldIndex: index});
        }
        return this;
    }
}

//
let taskManager: TaskManager|null = null;
export const initTaskManager = (): TaskManager =>{
    const wasInit = taskManager == null;
    const Manager = (taskManager ??= new TaskManager());

    //
    if (wasInit) {
        history.pushState(null, "", location.hash = location.hash || "#");
        addEventListener("popstate", (ev)=>{
            ev.preventDefault();
            ev.stopPropagation();

            //
            if (window.dispatchEvent(new CustomEvent("ui-back", {
                bubbles: true,
                cancelable: true,
                detail: ev,
            }))) {
                const focus = Manager.getOnFocus();
                if (focus?.id) { history.go(1); Manager.deactivate(focus.id); }
                if (!focus || !location.hash || location.hash == "#") { close(); }
            }
        });
    }

    //
    return Manager;
}

//
export default initTaskManager;
