# AHP Development Guide

This repository uses https://github.com/maximegris/angular-electron as the code base.

The following content is a simplified version of https://github.com/maximegris/angular-electron

---

Framework version:

- Angular v15.2.9
- Electron v24.3.0

## Project structure

| Folder | Description |
| --- | --- |
| app | Electron main process folder (NodeJS) |
| src | Electron renderer process folder (Web / Angular) |
| lib | External libraries |

## How to import 3rd party libraries

According to maximegris from the base repo, **you have to import your dependencies the right way**. 

There are two kind of 3rd party libraries :

- NodeJS's one - Uses NodeJS core module (crypto, fs, util...)
    - Add this kind of 3rd party library in `dependencies` of both `app/package.json` and `package.json (root folder)` in order to make it work in both Electron's Main process (app folder) and Electron's Renderer process (src folder).

Please check `providers/electron.service.ts` to watch how conditional import of libraries has to be done when using NodeJS / 3rd party libraries in renderer context (i.e. Angular).

- Web's one (like bootstrap, material, tailwind...)
    - It have to be added in `dependencies` of `package.json (root folder)`

⚠️ ng-add (ng add) **might not work**

## Included Commands

| Command | Description |
| --- | --- |
| npm run ng:serve | Execute the app in the web browser (DEV mode) |
| npm run web:build | Build the app that can be used directly in the web browser. Your built files are in the /dist folder. |
| npm run electron:local | Builds your application and start electron locally |
| npm run electron:build | Builds your application and creates an app consumable based on your operating system |

---