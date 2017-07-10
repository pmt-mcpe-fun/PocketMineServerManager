/**
 * server.js - Server instance
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 */

const { spawn } = require('child_process');
const { app } = require('electron');
const fs = require('fs');
const path = require('path');
const properties = require('./lib/properties');

/**
 * Server class
 * 
 * @param {String} name
 * @param {{}} php
 */
exports.Server = function(name, php) {

    this.name = name;
    this.folder = path.join(php.app.serverFolder, name);
    this.isStarted = false;
    this.players = {};
    this.log = "";
    this.php = php;
    this.changed = false;
    this.settings = properties.parseProperties(fs.readFileSync(path.join(this.folder, "server.properties")).toString());

    /**
     * Starts the server
     */
    this.start = function() {
        this.log += "[PMS] Starting server " + this.name + "...\n";
        this.proc = spawn(php.phpExecutable, [path.join(this.folder, "PocketMine-MP.phar")]);
        this.isStarted = true;

        this.proc.stdout.on('data', (data) => {
            this.log += data;
        });

        this.proc.stderr.on('data', (data) => {
            this.log += data;
        });

        this.proc.stdin.on('data', (data) => {
            this.log += "> " + Command + "\n";
        });

        this.proc.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            this.log("[PMS] Server stopped.");
            fs.writeFileSync(path.join(this.folder, "server.properties"), properties.emitProperties(this.settings));
        });
    }


    this.inputCommand = function(Command) {
        this.proc.stdin.write(Command);
    };

}


/**
 * Creates a version of the server exportable to the process
 */
exports.ServerExportable = function() {

    /**
     * Import server instance
     */
    this.import = function(Server) {
        this.name = Server.name;
        this.isStarted = Server.isStarted;
        this.players = Server.players;
        this.log = Server.log;
        this.commands = [];
        this.settings = Server.settings
    }

    /**
     * Exports to a server instance
     */
    this.export = function(Server) {
        if (this.isStarted && !Server.isStarted) {
            Server.start();
        }
        Server.log = this.log;
        Server.settings = this.settings;
        this.commands.forEach(function(cmd) {
            Server.inputCommand(cmd);
        }, this);
    }
}