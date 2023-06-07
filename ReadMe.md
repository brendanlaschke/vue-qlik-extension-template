# Vue-Qlik-Extension

It is well known that you can write Qlik Extensions in plain js, angularjs or react(with or without the supernova api). But it is also possible to write Qlik Extensions in Vue3 very similar to the angularjs extensions. This extension is a boilerplate for writing an extension almost completley in Vue3 and Typescript. 


## Why?

Vue3 is a lot faster than angularjs, provides typesupport (even in the template), reusable components and VSCode Extensions. Also you don't want to use the depreceated angularjs to only develop extensions.

## Features

All files are Typescript files, the extension is build using webpack and styles are less styles. Depending on your preference the latter two can be changed. The important ones are described below:

### `package.json`

The ``package.json`` contains all dependencies and build scripts. But also the `extensionMetaInfo` used for building and generating the .qext file is placed here:
* `extName`: The Extension name used as Zip name and Internal Extension name visible in the QMC (only normal characters including spaces allowed)
* `visualName`: Display Extension Name visible in the Qlik Client (can contain special characters)
* `description`: description ...
* `icon`: The Extension icon - this can be **every** Lui Icon contrary to what is stated in the documentation. If you are able to import some file before loading the extension you can also place any css icon class here.
* `preview`: path to the logo
* `bundle` The Bundle Information only needed if you want to place your extension into its own accordion tab in the Qlik Extension menu.
    * `id`: BundleID
    * `name`: BundleName
    * `description`: Bundle description

### `webpack.config.js`

For the build file, we tried lots of different settings but had to use babel to get a result. If you know how to bundle the extension without one of the many build packages please let me know via an pull request or issue :) 

### `qlik.typings.d.ts`

The Qlik api types. This is a mashup of different API documentations(mostly the @types packages for qlik) and some adapted types from the qlik documentation. If there are errors or missing functions/parameters feel free to open a pull request.

### `qlik/defintion.ts`

Qlik Defintion (properties panel) including functions for sheets, variables and objects.

### `qlik/initialProperties.ts`

The classic initial Properties nothing changed here to the Qlik documentation.

### `index.ts`

Initizalizing the vue app. 

### `src/app.vue`

Here you can start developing in Vue. You have access to most needed apis: 

```typescript
import qlik from 'qlik'; // access to the qlik RootApi
import qr from 'qr': // alias for require 
import jquery from 'jquery'; // the installed jquery (not recommended to use if you have vue)
import qvangular from 'qvangular'; // access to the angularjs included in qlik (no usage to be expected if you don't use angularjs )
// also other libraries inclueded in qlik can be made available here by using the webpack config
```


## Start Developing

You need QS Desktop to develop and test the extension.

Clone the repo to any directory on your machine. It is recommended to place it outside of the Qlik Sense directory structure(not `/Documents/Qlik/Sense/Extensions`) as all files are indexed and served. If many node_modules are installed or files placed in the directory this may result in Qlik loading a few minutes even on really fast machines.

Install Dependencies
```bash
npm install
```

Start Webpack build to the QS Extension directory. This will create a directory in the QS directory `/Documents/Qlik/Sense/Extensions` with the cunfigured name.
```bash
npm start
```


Build a Version. This will create a `dist` directory in the project root. The placed `.zip` file is ready to be uploaded on a server.
```bash
npm run build
```
