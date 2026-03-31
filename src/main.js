const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 720,
    height: 680,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('save-result-file', async (event, resultText) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Зберегти результат розрахунку',
    defaultPath: 'result.txt',
    filters: [{ name: 'Text Files', extensions: ['txt'] }, { name: 'All Files', extensions: ['*'] }]
  });

  if (canceled || !filePath) {
    return { saved: false, message: 'Збереження скасовано.' };
  }

  try {
    fs.writeFileSync(filePath, resultText, 'utf8');
    return { saved: true, message: `Файл успішно збережено: ${filePath}` };
  } catch (error) {
    return { saved: false, message: `Помилка збереження: ${error.message}` };
  }
});
