//
type FX = ((a: any)=>any);

//
const replaceState = (hash = "")=>{
    /*if (location.hash != hash) {
        pendingChange = hash;
        history.replaceState(null, "", location.hash = hash || "#");
    }*/
}

//
export class TaskManager {
    #tasks: any[] = [];
    #events = new Map<string, FX[]>([]);

    //
    constructor(tasks = []) {
        this.#tasks  = tasks || [];
        this.#events = new Map<string, FX[]>([]);

        //
        addEventListener("hashchange", (ev)=>{
            this.focus(location.hash);
        });

        //
        if (history?.length <= 1) {
            history?.pushState?.("", "", location.hash = location.hash || "#");
        }

        //
        let ignoreForward = false;
        // prevent behaviour once...
        addEventListener("popstate", (ev)=>{
            ev.preventDefault();
            ev.stopPropagation();
            ev.stopImmediatePropagation();

            // hide taskbar before back
            const taskbar = (document.querySelector("ui-modal[type=\"contextmenu\"]:not([data-hidden])") ?? document.querySelector("ui-modal:not([data-hidden]), ui-taskbar:not([data-hidden])")) as HTMLElement;
            if (ignoreForward) {
                ignoreForward = false;
            } else
            if (matchMedia("not (((hover: hover) or (pointer: fine)) and ((width >= 9in) or (orientation: landscape)))").matches && taskbar && !ignoreForward) {
                ignoreForward = true;
                history?.forward?.();
                if (!document.activeElement?.matches?.("input") || !taskbar?.matches?.("ui-modal")) {
                    taskbar.dataset.hidden = "";
                } else {
                    (document.activeElement as any)?.blur?.();
                }
            } else
            if (taskManager && !ignoreForward) {
                const id = taskManager.getOnFocus(false)?.id || "#";
                if (id && id != "#") {
                    ignoreForward = true;
                    history?.forward?.();
                    taskManager.deactivate(id, false);
                    if (id?.replace?.("#","")?.startsWith("TASK-")) {
                        taskManager.removeTask(id);
                    }
                }
            }
        });
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
    getOnFocus(includeHash = true) {
        return this.#tasks.findLast((t)=>t.active) || (includeHash ? this.get(location.hash) : "#");
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
        const task  = this.tasks[index];
        if (index >= 0 && index < (this.tasks.length-1)) {
            this.tasks.splice(index, 1);
            this.tasks.push(task);
        }

        //
        if (index >= 0) { this.trigger("focus", {task, self: this, oldIndex: index, index: (this.tasks.length-1)}); };

        //
        if (location?.hash?.trim?.() != taskId?.trim?.() && taskId)
            {
                const oldHash = location.hash;
                replaceState(taskId || oldHash);
            };

        // may breaking...
        if (history?.length <= 1 && taskId) {
            history?.pushState?.("", "", location.hash = location.hash || "#");
        }

        //
        return this;
    }

    //
    deactivate(taskId: string, trigger = true) {
        const index = this.tasks.findIndex((t)=>t.id == taskId);
        if (index >= 0) {
            const task = this.tasks[index];
            if (task?.active) { task.active = false; };
            this.trigger("deactivate", {task, self: this, index});
        }

        //
        if (location?.hash?.trim?.() == taskId?.trim?.() && taskId)
            {
                const newHash = this.getOnFocus(false)?.id || "#";
                if (trigger) { replaceState(newHash); }
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
    //const wasInit = taskManager == null;
    const Manager = (taskManager ??= new TaskManager());
    return Manager;
}

//
export default initTaskManager;
