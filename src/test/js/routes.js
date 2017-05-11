'use strict';

/**
 * @author palmtale
 * @since 2017/5/11.
 */


import KoaRouter from 'koa-router';

export default class Router extends KoaRouter {
    constructor(container) {
        super();
        const webAuth = container.module('web.auth');
        this.post('/login', async (ctx) => await webAuth.login(ctx));
        this.get('/logout', webAuth.logout);
        const apiAuth = container.module('api.auth.server');
        this.post('/oauth/token', apiAuth.token);
        this.post('/oauth/authorize', apiAuth.authorize);
        this.post('/oauth/authenticate', apiAuth.authenticate);
    }
}