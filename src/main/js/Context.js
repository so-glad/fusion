
'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */

import _ from 'lodash';
import path from 'path';


const changePathVars = (config) => {
    for(const key in config) {
        const value = config[key];
        if(_.isString(value)) {
            config[key] = value
                .replace('${path.client}', config.path.client)
                .replace('${path.server}', config.path.server)
                .replace('${path.resources}', config.path.resources);
        } else if(_.isObject(value)) {
            changePathVars(config[key], resultConfig[key]);
        }
    }
    return config;
};

const refactorPath = (config) => {
    if(!config.path.root && !config.path.server) {
        config.path.server = __dirname;
        config.path.root = path.join(__dirname, '..');
    } else if(!config.path.root) {
        let relation = '..', serverPath = config.path.server;
        while(serverPath.indexOf('/') > 0 ) {
            serverPath = serverPath.substring(serverPath.indexOf('/') + 1);
            relation += '/..';
        }
        config.path.root = path.join(__dirname, relation);
    }
    //Change path to absolute path.
    if(process.platform === 'windows') {
        if(config.path.client.indexOf(':\\') !== 1 ) {
            config.path.client = path.join(config.path.root, config.path.client);
        }
        if(config.path.server.indexOf(':\\') !== 1 ) {
            config.path.server = path.join(config.path.root, config.path.server);
        }
        if(config.path.resources.indexOf(':\\') !== 1 ) {
            config.path.resources = path.join(config.path.root, config.path.resources);
        }
    } else {
        if(config.path.client.indexOf('/') !== 0 ) {
            config.path.client = path.join(config.path.root, config.path.client);
        }
        if(config.path.server.indexOf('/') !== 0 ) {
            config.path.server = path.join(config.path.root, config.path.server);
        }
        if(config.path.resources.indexOf('/') !== 0 ) {
            config.path.resources = path.join(config.path.root, config.path.resources);
        }
    }
    return changePathVars(config);
};

export default class Context {

    config = null;

    modules = {};

    constructor(config) {
        this.config = _.cloneDeep(config);
        this.config = refactorPath(this.config);
    }

    module(name, module) {
        if(module) {
            this.modules[name] = module;
            return this;
        } else {
            return this.modules[name];
        }
    }

    register(name, module) {
        this.modules[name] = module;
        return this;
    }

    getModule(name) {
        return this.modules[name];
    }
};