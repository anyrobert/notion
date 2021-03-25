const { app, Tray, Menu, nativeImage, BrowserWindow } = require("electron");
const path = require("path");

if (require("electron-squirrel-startup")) return app.quit();

let tray;
let contextMenu;

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    darkTheme: true,
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: "./icons/logo.png",
  });
  win.loadFile("index.html");
}

function handleOpenApp() {
  app.emit("activate");
  app.focus({ steal: true });
}

function createTray() {
  tray = new Tray(
    nativeImage.createFromPath(path.join(__dirname, "icons/icon.png"))
  );
  contextMenu = Menu.buildFromTemplate([
    { label: "Abrir", type: "normal", click: handleOpenApp },
  ]);
  tray.setToolTip("Notion");
  tray.setContextMenu(contextMenu);
  // updateTrayMenu();
}

// function updateTrayMenu() {
//   console.log(webContents.getFocusedWebContents());
//   const menuItem = new MenuItem({ label: "teste", type: "normal" });
//   contextMenu.append(menuItem);
//   tray.setContextMenu(contextMenu);
// }

app.whenReady().then(() => {
  createWindow();
  createTray();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

if (handleSquirrelEvent()) {
  return;
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require("child_process");
  const path = require("path");

  const appFolder = path.resolve(process.execPath, "..");
  const rootAtomFolder = path.resolve(appFolder, "..");
  const updateDotExe = path.resolve(path.join(rootAtomFolder, "Update.exe"));
  const exeName = path.basename(process.execPath);

  const spawn = function (command, args) {
    let spawnedProcess;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case "--squirrel-install":
    case "--squirrel-updated":
      spawnUpdate(["--createShortcut", exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case "--squirrel-uninstall":
      spawnUpdate(["--removeShortcut", exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case "--squirrel-obsolete":
      app.quit();
      return true;
  }
}
