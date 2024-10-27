(async ()=>{
    const electron = require( 'electron' );//(await import('electron')).default;
    const { contextBridge, ipcRenderer, webFrame } = electron;

    //
    contextBridge.exposeInMainWorld('darkMode', {
        toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
        system: () => ipcRenderer.invoke('dark-mode:system'),
    })

    //
    contextBridge.exposeInMainWorld('electronBridge', {
        setThemeColor: (color, symbolColor) => {
            ipcRenderer.invoke('theme-color:change', [color, symbolColor]);
            //titleBarOverlay
        }
    });

    // Will be used as IPC channeling
    window.addEventListener('DOMContentLoaded', () => {
        // TODO for IPC initializer (injector)

        /*
        const replaceText = (selector, text) => {
            const element = document.getElementById(selector)
            if (element) element.innerText = text
        }

        for (const type of ['chrome', 'node', 'electron']) {
            replaceText(`${type}-version`, process.versions[type])
        }*/
    });

})();

