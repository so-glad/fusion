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

    getAuthorizeUrlForLogin = async (ctx, next) => {
        const type = ctx.params.provider;
        const authorizeUrl = await this.service.generateAuthorizeUrl(type, 'login');
        if (!next) {
            ctx.response.header['content-type'] = 'application/json;charset=utf-8';
            ctx.body = {result: true, url: authorizeUrl, type: type};
        } else {
            ctx.state.oauth = {result: true, url: authorizeUrl, type: type};
            await next();
        }
    };

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
            const {error, accessToken} = await this.service.getAccessTokenByCode(type, code, state);
            if (error) {
                this.logger.error(error);
                result = {result: false, cause: error, provider: type};
            } else {
                const user = await this.service.getUserByAccessToken(type, accessToken);
                result = (user && user.id) ? {result: true, user: user, provider: type}
                    : {result: false, cause: accessToken, provider: type};
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
    }
}