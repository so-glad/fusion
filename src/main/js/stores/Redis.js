
'use strict';

/**
 * @author palmtale
 * @since 2017/5/5.
 */


import _debug from 'debug';
import redis from 'redis';
import {promisefy} from '../utils';
import {EventEmitter} from 'events';

const debug = _debug('redis:store');

export default class RedisStore extends EventEmitter {

    constructor(options) {
        super();
        options = options || {};

        let client = null;
        options.auth_pass = options.auth_pass || options.pass || null;     // For backwards compatibility
        options.path = options.path || options.socket || null;             // For backwards compatibility
        if (!options.client) {
            debug('Init redis new client');
            client = redis.createClient(options);
        } else {
            if (options.duplicate) {                                         // Duplicate client and update with options provided
                debug('Duplicating provided client with new options (if provided)');
                const dupClient = options.client;
                delete options.client;
                delete options.duplicate;
                client = dupClient.duplicate(options);                         // Useful if you want to use the DB option without adjusting the client DB outside koa-redis
            } else {
                debug('Using provided client');
                client = options.client;
            }
        }

        if (options.db) {
            debug('selecting db %s', options.db);
            client.select(options.db);
            client.on('connect', () => {
                client.send_anyways = true;
                client.select(options.db);
                client.send_anyways = false;
            });
        }

        client.on('error', this.emit.bind(this, 'error'));
        client.on('end', this.emit.bind(this, 'end'));
        client.on('end', this.emit.bind(this, 'disconnect'));              // For backwards compatibility
        client.on('connect', this.emit.bind(this, 'connect'));
        client.on('reconnecting', this.emit.bind(this, 'reconnecting'));
        client.on('ready', this.emit.bind(this, 'ready'));
        client.on('warning', this.emit.bind(this, 'warning'));
        this.on('connect', () => {
            debug('connected to redis');
            this.connected = client.connected;
        });
        this.on('ready', () => {
            debug('redis ready');
        });
        this.on('end', () => {
            debug('redis ended');
            this.connected = client.connected;
        });
        // No good way to test error
        /* istanbul ignore next */
        this.on('error', () => {
            debug('redis error');
            this.connected = client.connected;
        });
        // No good way to test reconnect
        /* istanbul ignore next */
        this.on('reconnecting', () => {
            debug('redis reconnecting');
            this.connected = client.connected;
        });
        // No good way to test warning
        /* istanbul ignore next */
        this.on('warning', () => {
            debug('redis warning');
            this.connected = client.connected;
        });

        //wrap redis
        this._redisClient = client;
        this.client = client;
        this.connected = client.connected;
    }

    get = async (key) => {
        const data = await promisefy(this.client, this.client.get)(key);
        debug('get session: %s', data || 'none');
        if (!data) {
            return null;
        }
        try {
            return JSON.parse(data.toString());
        } catch (err) {
            // ignore err
            debug('parse session error: %s', err.message);
        }
    };

    set = async (key, session, maxAge) => {
        if (typeof maxAge === 'number') {
            maxAge = Math.ceil(maxAge / 1000);
        }
        session = JSON.stringify(session);
        if (maxAge) {
            debug('SETEX %s %s %s', key, maxAge, session);
            await this.client.setex(key, maxAge, session);
        } else {
            debug('SET %s %s', key, session);
            await this.client.set(key, session);
        }
        debug('SET %s complete', key);
    };

    destroy = async (key) => {
        debug('DEL %s', key);
        await this.client.del(key);
        debug('DEL %s complete', key);
    };

    quit = async () => {
        debug('quitting redis client');
        await this.client.quit();
    };

    end = this.quit;
};