
'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */

import _ from 'lodash';
import path from 'path';

import RedisStore from "./stores/Redis";


const changePathVars = (config, confPath) => {
    for(const key in config) {
        if(_.isString(config[key])) {
            config[key] = config[key]
                .replace('${path.root}', confPath.root)
                .replace('${path.client}', confPath.client)
                .replace('${path.server}', confPath.server)
                .replace('${path.resources}', confPath.resources);
        } else if(_.isObject(config[key])) {
            config[key] = changePathVars(config[key], confPath);
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
    return changePathVars(config, config.path);
};

const configSession = (config) => {
    const redisBasic = config.databases.redis;

    if(config.session.store.indexOf('redis') === 0) {
        const sessionRedis = _.clone(redisBasic);
        if(config.session.store.length >= 7) {
            sessionRedis.db = parseInt(config.session.store.substring(6));
        } else {
            sessionRedis.db = 0;
        }
        config.session.store = new RedisStore(sessionRedis);
    }
};

export default class Context {

    config = null;

    modules = {};

    constructor(config) {
        this.config = _.cloneDeep(config);
        this.config = refactorPath(this.config);
        configSession(this.config);
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