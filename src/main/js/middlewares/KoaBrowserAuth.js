
'use strict';

/**
 * @author palmtale
 * @since 2017/5/5.
 */

export default class KoaBrowserAuth {

    apiAuth = null;

    oauthService = null;

    defaultClient = null;

    constructor(container) {
        this.apiAuth = container.module('api.auth');
        // this.oauthService = this.apiAuth.oauthService;
        this.defaultClient = container.module('default.client');
    }
    //OAuth Server actions group
    login = async (ctx, next) => {
        ctx.request.body.grant_type = 'password';
        ctx.request.body.client_id = this.defaultClient.clientId;
        ctx.request.body.client_secret = this.defaultClient.clientSecret;
        await this.apiAuth.token(ctx, async () => {
            if(!ctx.state.oauth) {
                await next();
                return;
            }
            if(ctx.regenerateSession) {
                await ctx.regenerateSession();
            }
            ctx.session.client = ctx.state.oauth.client;
            ctx.session.user = ctx.state.oauth.user;
            await next();
        });
    };

    authed = async (ctx, next) => {
        if(ctx.session.user && ctx.session.client) {
            await next();
        } else {
            await this.apiAuth.authenticate(ctx, next);
        }
    };

    logout = async (ctx, next) => {
        this.apiAuth.revoke(ctx.session.auth);
        ctx.session = null;
        await next();
    };

    roleRequired = (role, next) =>  (async (ctx, next) => {

    });

    //OAuth client actions group
    redirectAuthorizeUrl = async (ctx, next) => {
        this.oauthService.redirect();
    };

    callbackAuthorizeCode = async (ctx, next) => {

    }
};

/** In authed method the remember me logic */
// const remember = ctx.cookies.get('remember', {signed: true});
// if(remember) {
//     const remembers = remember.split(';');
//     const user = await userService.findUserByUsername(remembers[0]);
//     const client = await oauthService.findClientById(remembers[1]);
//     if(ctx.regenerateSession) {
//         ctx.regenerateSession();
//     }
//     ctx.session.user = filterUser(user);
//     ctx.session.client = filterClient(client);
// }