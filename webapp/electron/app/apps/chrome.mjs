//import module from 'module-alias';
import electron from 'electron';
import path from 'path';

//
const { BrowserWindow } = electron;

//
export default class ChromeApp {
    constructor(app) {
        this.app = app;
        this.browser = null;
        this.shown = false;
    }

    //
    init() {
        if (!this.browser) {
            const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
            const webPreferences = {
                allowRunningInsecureContent: true,
                webSecurity: false,
                experimentalFeatures: true,
                contextBridge: true,
                nodeIntegration: true,
                sandbox: false,
                devTools: true,
                transparent: true,
                preload: path.resolve(import.meta.dirname, "../agents/injector.mjs")
            };

            //
            this.browser = new BrowserWindow({
                width,
                height,
                center: true,
                show: false,
                frame: false,
                titleBarStyle: 'hidden',
                titleBarOverlay: true,
                webPreferences
            });

            //
            this.browser.once('ready-to-show', () => this.browser.maximize());
        }
    }

    //
    loadURL(index = "https://localhost:8000/") {
        if (!this.shown) {
            this.shown = true;
            this.browser.loadURL(index);
            this.browser.show();
            this.browser.webContents.openDevTools();
        }
    }

    //
    loadFile(index = "./index.html") {
        if (!this.shown) {
            this.shown = true;
            this.browser.loadFile(index);
            this.browser.show();
            this.browser.webContents.openDevTools();
        }
    }

    //
    close() {
        this.shown = false;
        this.browser.close();
        this.browser = null;
    }
}
