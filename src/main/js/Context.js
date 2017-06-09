'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */


import path from 'path';

const changePathVars = (config, confPath) => {
    for (const key in config) {
        if (typeof config[key] === 'string') {
            config[key] = config[key]
                .replace('${path.root}', confPath.root)
                .replace('${path.client}', confPath.client)
                .replace('${path.server}', confPath.server)
                .replace('${path.resources}', confPath.resources)
                .replace('${APP_HOME}', process.env.APP_HOME);
        } else {
            config[key] = changePathVars(config[key], confPath);
        }
    }
    return config;
};

const refactorPath = (config) => {
    if (!config.path.root && !config.path.server) {
        config.path.server = __dirname;
        config.path.root = path.join(__dirname, '..');
    } else if (!config.path.root) {
        let relation = '..', serverPath = config.path.server;
        while (serverPath.indexOf('/') > 0) {
            serverPath = serverPath.substring(serverPath.indexOf('/') + 1);
            relation += '/..';
        }
        config.path.root = path.join(__dirname, relation);
    }
    //Change path to absolute path.
    if (process.platform === 'windows') {
        if (config.path.client.indexOf(':\\') !== 1) {
            config.path.client = path.join(config.path.root, config.path.client);
        }
        if (config.path.server.indexOf(':\\') !== 1) {
            config.path.server = path.join(config.path.root, config.path.server);
        }
        if (config.path.resources.indexOf(':\\') !== 1) {
            config.path.resources = path.join(config.path.root, config.path.resources);
        }
    } else {
        if (config.path.client.indexOf('/') !== 0) {
            config.path.client = path.join(config.path.root, config.path.client);
        }
        if (config.path.server.indexOf('/') !== 0) {
            config.path.server = path.join(config.path.root, config.path.server);
        }
        if (config.path.resources.indexOf('/') !== 0) {
            config.path.resources = path.join(config.path.root, config.path.resources);
        }
    }
    return changePathVars(config, config.path);
};

export default class Context {

    config = null;

    constructor(config) {
        this.config = Object.assign({}, config);
        this.config = refactorPath(this.config);
    }

    get = (name) => {
        if(!name) {
            return this;
        }
        const segments = name.split('.');
        let currentNode = this;
        for(const i in segments){
            currentNode = currentNode[segments[i]];
        }
        return currentNode;
    };

    set = (name, object) => {
        if(!name || typeof name !== 'string') {
            return object;
        }
        const segments = name.split('.');
        let currentNode = this;
        let count;
        for(const i in segments) {
            count = i;
            if(i > 0) {
                currentNode = currentNode[segments[i-1]];
            }
            if(!currentNode[segments[i]]) {
                currentNode[segments[i]] = {};
            }
        }
        return currentNode[segments[count]] = object;
    };

    register = (name, module) => {
        this.set(name, module);
        return this;
    };
}