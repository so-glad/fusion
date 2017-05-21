'use strict';

/**
 * @author palmtale
 * @since 2017/5/8.
 */


import _ from 'lodash';
import log4js from 'koa-log4';


export default class KoaOAuthClient {

    service = null;
    logger = console;

    constructor(options) {
        this.service = options.service;
        this.logger = options.logger ?
            ( _.isString(options.logger) ? log4js.getLogger(options.logger) : options.logger )
            : console;
        delete options.logger;
    }

    getUserByProviderCode = async (ctx, next) => {
        //TODO Verify state.
        const type = ctx.params.provider;
        if (ctx.request.query.error) {
            this.logger.error(ctx.request.query);
            ctx.status = 403;
            return;
        }
        const code = ctx.request.query.code;
        const state = ctx.request.query.state;
        let result = null;
        try {
            const access = await this.service.exchangeAccessTokenByCode(type, code, state);
            if (access.error) {
                this.logger.error(access.error);
                result = {result: false, cause: access.error, provider: type};
            } else {
                const user = await this.service.getUserByAccessToken(type, access.params());
                result = (user && user.id) ? {result: true, user: user, provider: type}
                    : {result: false, cause: 'Cannot get user by accessToken', provider: type};
            }
        } catch (e) {
            this.logger.error(e);
            result = {result: false, cause: e, provider: type};
        }
        if (!next) {
            ctx.response.header['content-type'] = 'application/json;charset=utf-8';
            ctx.body = result;
        } else {
            ctx.state.oauth = result;
            await next();
        }
    };
}