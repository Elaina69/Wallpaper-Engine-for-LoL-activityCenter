import utils from "./utils"

let getpluginsName = (): string | null => {
    const error = new Error();
    const stackTrace = error.stack;
    const scriptPath = stackTrace?.match(/(?:http|https):\/\/[^\s]+\.js/g)?.[0];
    const match = scriptPath?.match(/\/([^/]+)\/index\.js$/);
    return match ? match[1] : null;
}

let configs = (await (import(`//plugins/${getpluginsName()}/configs/configs.js`))).default

let getElementIndex = (el: any) => {
    return [...el.parentNode.children].indexOf(el);
}

let createNewIframe = async () => {
    let wallpaperEngineIframe = document.createElement("iframe")
    wallpaperEngineIframe.setAttribute("src", configs.wallpaperEngineLocalUrl)
    wallpaperEngineIframe.setAttribute("class", "wallpaperEngine")
    wallpaperEngineIframe.style.cssText = `
        width:100%; 
        height:100%; 
        position:absolute; 
        display: flex;
        left: -2px;
    `
    const viewportRoot: HTMLElement | null = document.querySelector("#rcp-fe-viewport-root");
    if (viewportRoot) {
        viewportRoot.insertBefore(wallpaperEngineIframe, viewportRoot.firstChild);
    }

    return wallpaperEngineIframe;
}

let pageListenner = async (node: any) => {      
    const pagename = node.getAttribute("data-screen-name");
    const isOtherPage = ![
        "rcp-fe-lol-home-main",
        "window-controls",
        "rcp-fe-lol-navigation-screen", 
        "social", 
        "rcp-fe-lol-activity-center-main"
    ].includes(pagename);

    if (!isOtherPage) {
        let activityCenterChinese: any = document.querySelector(".managed-iframe-wrapper > iframe")
        if (activityCenterChinese) {
            activityCenterChinese.setAttribute("src", "")
        }

        let wallpaperEngine: HTMLElement|null = document.querySelector(".wallpaperEngine")
        if (!wallpaperEngine) {
            await createNewIframe()
        }
        else {
            wallpaperEngine.style.display = "flex"
            let mainViewport = document.querySelector(".rcp-fe-viewport-main") as HTMLElement | null;
            if (mainViewport) {
                mainViewport.style.zIndex = "-9999";
            }

            let persistentViewport = document.querySelector(".rcp-fe-viewport-persistent") as HTMLElement | null;
            if (persistentViewport) {
                persistentViewport.style.zIndex = "-9999";
            }
        }
    }
    else {
        let wallpaperEngine: HTMLElement|null = document.querySelector(".wallpaperEngine")
        if (!wallpaperEngine) {}
        else {
            if (configs.overridingTheme.wallpaper) {
                wallpaperEngine.style.display = "flex"
            }
            else {
                wallpaperEngine.style.display = "none"
            }

            let mainViewport: HTMLElement | null = document.querySelector(".rcp-fe-viewport-main")
            if (mainViewport) {
                mainViewport.style.zIndex = "0";
            }

            let persistentViewport: HTMLElement | null = document.querySelector(".rcp-fe-viewport-persistent")
            if (persistentViewport) {
                persistentViewport.style.zIndex = "0";
            }
        }
    }
};

window.addEventListener("load", async () => {
    utils.mutationObserverAddCallback(pageListenner, ["screen-root"])

    window.setInterval(async () => {
        let wallpaperEngine: HTMLElement|null = document.querySelector(".wallpaperEngine")
        if (wallpaperEngine) {
            let currentIndex = getElementIndex(wallpaperEngine)
            if (currentIndex > 0) {
                wallpaperEngine.remove()
                await createNewIframe()
            }
        }
    }, 1000)
})

window.addEventListener("keydown", async (event)=>{
    let key = event.key
    if (key=="F5") {
        let wallpaperEngine: HTMLElement|null = document.querySelector(".wallpaperEngine")
        if (wallpaperEngine) {
            wallpaperEngine.setAttribute("src", "")
            wallpaperEngine.setAttribute("src", configs.wallpaperEngineLocalUrl)
        }
    }
})