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
        this.get('/user', async(ctx) => await webAuth.user(ctx));
        this.get('/client', async(ctx) => await webAuth.client(ctx));
        this.get('/logout', webAuth.logout);
        const apiAuth = container.module('api.auth.server');
        this.post('/oauth/token', async (ctx) => await apiAuth.token(ctx));
        this.post('/oauth/authorize', apiAuth.authorize);
        const apiClient = container.module('api.auth.client');
        this.get('/oauth/:provider/authorize', async (ctx) => await apiClient.getAuthorizeUrl(ctx));
        this.get('/oauth/:provider/callback', async (ctx) => await apiClient.getAccessTokenByCode(ctx));
    }
}