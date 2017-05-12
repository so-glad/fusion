'use strict';

/**
 * @author palmtale
 * @since 2017/5/11.
 */


import http from 'http';
import log4js from 'koa-log4';

import App from 'koa';
import bodyParser from 'koa-bodyparser';
import json from 'koa-json';
import session from 'koa-session';
import send from 'koa-send';

import {Container} from '../../main/js/index';
import config from '../resources/config';
import Router from './routes';


const container = new Container(config);
const logger = log4js.getLogger('fuxion');
const httpLogger = log4js.getLogger('fuxion-http');
const router = new Router(container);


export default class Application {

    app = null;

    constructor() {
        this.app = new App();
        this.app.keys = ['fuxion', 'remember'];
        //Perform log
        this.app.use(async (ctx, next) => {
            const start = new Date();
            await next();
            const duration = new Date() - start;
            httpLogger.info(`Perform Log: ${ctx.method} ${ctx.url} - ${duration}ms`);
        });
        //Record user agent
        this.app.use(container.module('input.agent').each);
        //Http Log
        this.app.use(log4js.koaLogger(httpLogger, {level: 'auto'}));
        this.app.use(bodyParser());
        this.app.use(json());
        // Session
        this.app.use(session(container.config.session, this.app));
        // Static
        this.app.use(async (ctx, next) => {
            try {
                await send(ctx, ctx.path, {root: container.config.path.client});
            } catch (e) {
                await next();
            }
        });
        // Error logger
        this.app.on('error', async (err) => {
            logger.error('error occured:', err);
        });
    }

    withRouter = (router) => {
        if(this.app) {
            this.app.use(router.routes())
                .use(router.allowedMethods());
        }
        return this;
    };

    startUp = () => {
        const port = parseInt(container.config.port ||process.env.APP_PORT || 5000),
            server = http.createServer(this.app.callback());

        server.listen(port);

        server.on('error', (error) => {
            if (error.syscall !== 'listen') {
                throw error;
            }
            // handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    logger.error(port + ' requires elevated privileges');
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    logger.error(port + ' is already in use');
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });

        server.on('listening', () => {
            logger.info('Listening on port: %d', port);
        });
    }
}

new Application().withRouter(router).startUp();