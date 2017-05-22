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
        this.defaultClient = container.module('oauth.client.local');
    }

    //OAuth Server actions group
    login = async (ctx, next) => {
        if (ctx.state.oauth && ctx.state.oauth.user) {
            if (ctx.regenerateSession) {
                await ctx.regenerateSession();
            }
            if (ctx.request.body.remember) {
                ctx.cookies.set('remember', ctx.state.oauth.accessToken, {
                    maxAge: 86400000,
                    httpOnly: true,
                    signed: true
                });
            }
            ctx.session.client = ctx.state.oauth.client;
            ctx.session.user = ctx.state.oauth.user;
        }
        if (!next && ctx.state.oauth) {
            ctx.body = ctx.state.oauth.valueOf();
            ctx.response.header['content-type'] = 'application/json;charset=UTF-8';
        } else {
            await next(ctx);
        }
    };

    user = async (ctx, next) => {
        if (ctx.session && ctx.session.user) {
            if (!next) {
                ctx.body = ctx.session.user;
                ctx.response.header['content-type'] = 'application/json;charset=UTF-8';
            } else {
                await next();
            }
        } else {
            if (!next) {
                ctx.status = 403;
            }
        }
    };

    client = async (ctx, next) => {
        if (ctx.session && ctx.session.client) {
            if (!next) {
                ctx.body = ctx.session.client;
                ctx.response.header['content-type'] = 'application/json;charset=UTF-8';
            } else {
                await next();
            }
        } else {
            if (!next) {
                ctx.status = 403;
            }
        }
    };

    authed = async (ctx, next) => {
        if (ctx.session.user && ctx.session.client) {
            await next();
        } else {
            if (!ctx.request.header['Authorization'] && ctx.cookie.get('remember')) {
                ctx.request.header['Authorization'] = ('Bearer ' + ctx.cookie.get('remember'));
            }
            if (ctx.request.header['Authorization']) {
                await this.apiAsServer.authenticate(ctx, async () => {
                    if (ctx.state.oauth && ctx.state.oauth.user) {
                        if (ctx.regenerateSession) {
                            await ctx.regenerateSession();
                        }
                        ctx.session.client = ctx.state.oauth.client;
                        ctx.session.user = ctx.state.oauth.user;
                        await next();
                    } else {
                        ctx.status = 403;
                    }
                });
            } else {
                ctx.status = 403;
            }
        }
    };

    logout = async (ctx, next) => {
        this.apiAsServer.revoke(ctx.session.auth);
        ctx.session = null;
        await next();
    };

    roleRequired = (role, next) => (async (ctx, next) => {

    });

    //OAuth client actions group
    redirectAuthorizeUrl = async (ctx) => {
        // const provider = await this.apiAsClient.getAuthorizeUrlForLogin(ctx, next);
        //TODO conbine url and redirect.
        this.apiAsClient.getAuthorizeUrlForLogin(ctx, async () => {
            if(ctx.state.oauth.result) {
                ctx.res.redirect(ctx.state.oauth.url);
            }
        });
    };

    callbackAuthorizeCode = async (ctx, next) => {
        await this.apiAsClient.getUserAuthorizedByCode(ctx, next);
    }
};