# README

This is the repository for VS Code extension for BIF.

[![visual studio marketplace](https://vsmarketplacebadge.apphb.com/version-short/spoorthi.biffy.svg)](https://marketplace.visualstudio.com/items?itemName=spoorthi.biffy)


## Features

* Find all references (`Shift + Alt + F12`)
* Peek references (`Shift + F12`)
* Syntax highlighting 
* Bracket matching 
* Block commenting (`Ctrl + K + C` and `Ctrl + K + U`)
* Snippet completion


## Configuration
Before using the extension, it is recommended to set up the BIF Source Path
* conf.biffy.bifSource -
Go to `File > Preferences > Settings` and in the settings for Biffy give the path to your BIF-Source

In case the configuration is empty, the current workspace root folder is used to find the required references.


## Setup - Development

1. Open the [source](https://github.com/spoon611/Biffy) in VS Code.
2. Run `npm install`
3. Press `F5` or `Debug > Start debugging`
4. Open the BIF-Source in the newly opened instance of vscode

> Ensure typescript is installed in global scope. Else run `npm install -g typescript`


## TODO

* Extending snippets
* Jump to definition
* Icons for file types 


## Requirements

VS Code version should be higher than 1.30.0


## Known Issues

Check out [existing issues](https://github.com/spoon611/Biffy/issues) in the repository.

-----------------------------------------------------------------------------------------------------------

