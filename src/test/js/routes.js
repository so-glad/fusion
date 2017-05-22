'use strict';

/**
 * @author palmtale
 * @since 2017/5/11.
 */


import KoaRouter from 'koa-router';

const defaultClientForGrant = (ctx, container, grant) => {
    ctx.request.body.grant_type = grant;
    const client = container.module('oauth.client.web');
    ctx.request.body.client_id = client.id;
    ctx.request.body.client_secret = client.secret;
    ctx.request.query.provider = ctx.params.provider;
};

export default class Router extends KoaRouter {
    constructor(container) {
        super();
        const webAuth = container.module('web.auth');
        this.post('/login', async (ctx) => {
            defaultClientForGrant(ctx, container, 'password');
            await apiAuth.token(ctx, webAuth.login);
        });
        this.get('/user', async (ctx) => await webAuth.user(ctx));
        this.get('/client', async (ctx) => await webAuth.client(ctx));
        this.get('/logout', webAuth.logout);
        this.get('/login/:provider', async (ctx) => {
            if(!ctx.request.query.code && !ctx.request.query.access_token) {
                const typeKey = ctx.params.provider;
                const service = container.module('service.oauth.provider');
                const authorizeUrl = await service.generateAuthorizeUrl(typeKey, 'login');
                ctx.redirect(authorizeUrl);
            } else {
                defaultClientForGrant(ctx, container, 'proxy');
                await apiAuth.token(ctx, webAuth.login);
            }
        });

        const apiAuth = container.module('api.auth.server');
        this.post('/oauth/token', async (ctx) => await apiAuth.token(ctx));
        this.post('/oauth/authorize', apiAuth.authorize);

        this.get('/oauth/:provider', async (ctx) => {
            if(!ctx.request.query.code && !ctx.request.query.access_token) {
                const typeKey = ctx.params.provider;
                const service = container.module('service.oauth.provider');
                const authorizeUrl = await service.generateAuthorizeUrl(typeKey, 'login');
                ctx.response.header['content-type'] = 'application/json;charset=utf-8';
                ctx.body = {result: true, url: authorizeUrl, type: typeKey};
            } else {
                defaultClientForGrant(ctx, container, 'proxy');
                await apiAuth.token(ctx);
            }
        });
    }
}