
'use strict';

/**
 * @author palmtale
 * @since 2017/5/5.
 */

import _ from 'lodash';

const filterUser = (oriUser) => {
    const user = _.clone(oriUser);
    delete user.password;
    delete user.salt;
    delete user.emailVerified;
    delete user.mobileVerified;
    return user;
};

const filterClient = (oriClient) => {
    return _.cloneDeep(oriClient);
};

export default class KoaAuth {

    oauthClient = null;

    oauthServer = null;

    constructor(oauthServer) {
        this.oauthServer = oauthServer;
    }
    //OAuth Server actions group
    login = async (ctx, next) => {
        await this.oauthServer.token(ctx, async () => {
            if(!ctx.state.oauth) {
                await next();
                return;
            }
            if(ctx.regenerateSession) {
                await ctx.regenerateSession();
            }
            ctx.session.client = filterClient(ctx.state.oauth.token.client);
            ctx.session.user = filterUser(ctx.state.oauth.token.user);
            await next();
        });
    };

    authed = async (ctx, next) => {
        if(ctx.session.user && ctx.session.client) {
            await next();
        } else {
            await this.oauthServer.authenticate(ctx, next);
        }
    };

    logout = async (ctx, next) => {
        this.oauthServer.revoke(ctx.session.auth);
        ctx.session = null;
        await next();
    };

    roleRequired = (role, next) =>  (async (ctx, next) => {

    });

    //OAuth client actions group
    redirectAuthorizeUrl = async (ctx, next) => {
        this.oauthClient.redirect();
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