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

    getAuthorizeUrl = async (ctx, next) => {
        const type = ctx.params.provider;
        //TODO Add params, e.g. state.
        const authorizeUrl = this.service.generateAuthorizeUrl(type, 'user');
        if (!next) {
            ctx.response.header['content-type'] = 'application/json;charset=utf-8';
            ctx.body = {result: true, url: authorizeUrl, type: type};
        } else {
            ctx.state.oauth = {result: true, url: authorizeUrl, type: type};
            await next();
        }
    };

    getAccessTokenByCode = async (ctx, next) => {
        //TODO Verify state.
        const type = ctx.params.provider;
        const code = ctx.request.query.code;
        const state = ctx.request.query.state;
        const accessToken = await this.service.getAccessTokenByCode(type, code, state);
        const result = accessToken.error ? {result: false, cause: accessToken, type: type}
            : {result: true, token: accessToken, type: type};
        if (!next) {
            ctx.response.header['content-type'] = 'application/json;charset=utf-8';
            ctx.body = result;
        } else {
            ctx.state.oauth = result;
            await next();
        }
    }
}