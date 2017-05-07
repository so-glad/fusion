
'use strict';

/**
 * @author palmtale
 * @since 2017/5/5.
 */

import _ from 'lodash';


export default class KoaAuth {

    oauthServer = null;
    constructor(oauthServer) {
        this.oauthServer = oauthServer;
    }

    login = async (ctx, next) => {
        await this.oauthServer.token(ctx, async () => {
            if(ctx.state.oauth && ctx.regenerateSession) {
                await ctx.regenerateSession();
                ctx.session.client = _.cloneDeep(ctx.state.oauth.token.client);
                const user = _.clone(ctx.state.oauth.token.user);
                delete user.password;
                delete user.salt;
                delete user.emailVerified;
                delete user.mobileVerified;
                ctx.session.user = user;
            }
            await next();
        });
    };

    loginRequired = async (ctx, next) => {
        if(ctx.session.user && ctx.session.client) {
            await next();
        } else if(ctx.cookie.username) {
            // TODO Remember me: find user and client, put which into session.
        } else if (ctx.request.header.authorization) {
            // TODO Authorization: Bearer find user and client.
        } else {
            ctx.res.statusCode = 403;
        }
    };

    logout = async (ctx, next) => {
        this.oauthServer.revokeToken(ctx.session.auth);
        ctx.session = null;
        await next();
    };
};