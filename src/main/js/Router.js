'use strict';

/**
 * @author palmtale
 * @since 2017/6/1.
 */


const defaultClientForGrant = (ctx, container, grant) => {
    ctx.request.body.grant_type = grant;
    const client = container.module('oauth.client.web');
    ctx.request.body.client_id = client.id;
    ctx.request.body.client_secret = client.secret;
    ctx.request.query.provider = ctx.params.provider;
};
 
export default class Router {

    _router = null;

    authenticate = null;

    Role = {Admin: 1};

    roleRequired = async (roleId, ctx, next) => {
        await this.authenticate(ctx);
        const user = ctx.session.user || ctx.state.oauth.user;
        if(user.role_id === roleId) {
            await next(ctx);
        } else {
            ctx.status = 403;
        }
    };

    constructor(container, router) {
        this._router = router;

        const webAuth = container.module('web.auth');
        this.authenticate = webAuth.authenticate;

        //TODO implement CSRF code for login.
        this._router.get('/login', async (ctx) => ctx.body = {message: 'Not implemented'});
        this._router.post('/login', async (ctx) => {
            defaultClientForGrant(ctx, container, 'password');
            await apiAuth.token(ctx, webAuth.login);
        });
        this._router.get('/login/:provider', async (ctx) => {
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
        this._router.del('/login', webAuth.logout);
        this._router.get('/user', async (ctx) => await webAuth.user(ctx));
        this._router.get('/client', async (ctx) => await webAuth.client(ctx));


        const apiAuth = container.module('api.auth');
        this._router.post('/oauth/authorize', async ctx => {
            await apiAuth.authorize(ctx);
            ctx.body = ctx.state.oauth;
        });
        this._router.post('/oauth/token', async (ctx) => {
            await apiAuth.token(ctx);
            ctx.body = ctx.state.oauth.valueOf();
        });
        this._router.del('/oauth/token', async (ctx) => {
            await apiAuth.revoke(ctx);
            ctx.body = ctx.state.oauth;
        });
        this._router.get('/oauth/:provider', async (ctx) => {
            if(!ctx.request.query.code && !ctx.request.query.access_token) {
                const typeKey = ctx.params.provider;
                const service = container.module('service.oauth.provider');
                const authorizeUrl = await service.generateAuthorizeUrl(typeKey, 'login');
                ctx.response.header['content-type'] = 'application/json;charset=utf-8';
                ctx.body = {result: true, url: authorizeUrl, type: typeKey};
            } else {
                defaultClientForGrant(ctx, container, 'proxy');
                await apiAuth.token(ctx);
                ctx.body = ctx.state.oauth.valueOf();
            }
        });

        this.routes = () => this._router.routes.apply(this._router);
        this.allowedMethods = () => this._router.allowedMethods.apply(this._router);
    }
}