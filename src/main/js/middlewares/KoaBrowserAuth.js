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
                await next(ctx);
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
                await next(ctx);
            }
        } else {
            if (!next) {
                ctx.status = 403;
            }
        }
    };

    authenticate = async (ctx, next) => {
        if (ctx.session.user && ctx.session.client) {
            await next(ctx);
        } else {
            if (!ctx.request.header['Authorization'] && ctx.cookies.get('remember')) {
                ctx.request.header['Authorization'] = ('Bearer ' + ctx.cookies.get('remember'));
            }
            if (ctx.request.header['Authorization']) {
                await this.apiAsServer.authenticate(ctx, async () => {
                    if (ctx.state.oauth && ctx.state.oauth.user) {
                        if (ctx.regenerateSession) {
                            await ctx.regenerateSession();
                        }
                        ctx.session.client = ctx.state.oauth.client;
                        ctx.session.user = ctx.state.oauth.user;
                        await next(ctx);
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
        await next(ctx);
    };
}