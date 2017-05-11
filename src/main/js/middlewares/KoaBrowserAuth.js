
'use strict';

/**
 * @author palmtale
 * @since 2017/5/5.
 */

export default class KoaBrowserAuth {

    apiAsServer = null;
    apiAsClient = null;
    defaultClient = null;

    constructor(container) {
        this.apiAsServer = container.module('api.auth.server');
        this.apiAsClient = container.module('api.auth.client');
        this.defaultClient = container.module('default.client');
    }
    //OAuth Server actions group
    login = async (ctx, next) => {
        ctx.request.body.grant_type = 'password';
        ctx.request.body.client_id = this.defaultClient.clientId;
        ctx.request.body.client_secret = this.defaultClient.clientSecret;
        await this.apiAsServer.token(ctx, async () => {
            if(ctx.state.oauth && ctx.state.oauth.user) {
                if(ctx.regenerateSession) {
                    await ctx.regenerateSession();
                }
                // ctx.response.setHeader('Set-cookie', 'remember=' + ctx.state.oauth.token.accessToken);
                ctx.session.client = ctx.state.oauth.client;
                ctx.session.user = ctx.state.oauth.user;
            }
            if(!next) {
                ctx.body = ctx.state.oauth;
                ctx.response.header['content-type'] = 'application/json;charset=UTF-8';
            } else {
                await next();
            }
        });
    };

    authed = async (ctx, next) => {
        if(ctx.session.user && ctx.session.client) {
            await next();
        } else {
            // if(ctx.cookie.get('remember')) {
            //     ctx.request.header('Authorization', 'Bearer ' + ctx.cookie.get('remember'))
            // }
            await this.apiAsServer.authenticate(ctx, next);
        }
    };

    logout = async (ctx, next) => {
        this.apiAsServer.revoke(ctx.session.auth);
        ctx.session = null;
        await next();
    };

    roleRequired = (role, next) =>  (async (ctx, next) => {

    });

    //OAuth client actions group
    redirectAuthorizeUrl = async (ctx, next) => {
        const provider = await this.apiAsClient.getAuthorizeUrl(ctx, next);
        //TODO conbine url and redirect.
        ctx.res.redirect();
    };

    callbackAuthorizeCode = async (ctx, next) => {
        await this.apiAsClient.getUserAuthorizedByCode(ctx, next);
    }
};