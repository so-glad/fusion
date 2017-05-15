
'use strict';

/**
 * @author palmtale
 * @since 2017/5/8.
 */


import _ from 'lodash';
import log4js from 'koa-log4';
import oauth from 'oauth';

export default class KoaOAuthClient {

    service = null;
    logger = console;
    handlers = [];

    constructor(options) {
        this.service = options.service;
        this.logger = options.logger ?
            ( _.isString(options.logger) ? log4js.getLogger(options.logger) : options.logger )
            : console;
        delete options.logger;
        for(const index in options.providers) {
            const provider = options.providers[index];
            this.handlers[provider.type] = new oauth.OAuth2(provider.clientId, provider.clientSecret,
                '',
                provider.authorizeUrl,
                provider.tokenUrl,
                {});
        }
    }

    getAuthorizeUrl = async (ctx, next) => {
        const type = ctx.params.provider;
        const handler = this.handlers[type];
        if(!handler) {
            //TODO error.
        }
        //TODO Add params, e.g. state.
        const params = {state: 'fdafda', scope: 'fuck'};
        const authorizeUrl = handler.getAuthorizeUrl(params);
        if(!next) {
            ctx.response.header['content-type'] = 'application/json;charset=utf-8';
            ctx.body = {result: true, url: authorizeUrl, type: type};
        } else {
            ctx.state.oauth = {result: true, url: authorizeUrl, type: type};
            await next();
        }
    };

    getAccessTokenByCode = async (ctx, next) => {
        //TODO Verify state.
        const type = ctx.request.body.type;
        const handler = this.handlers[type];
        if(!handler) {
            //TODO error.
        }
        const params = {};
        handler.getOAuthAccessToken(ctx.request.body.code, params, (err, accessToken, refreshToken, others) => {
            if(!next) {
                ctx.response.header['content-type'] = 'application/json;charset=utf-8';
                ctx.body = {result: true, accessToken: accessToken, refreshToken: refreshToken, extra: others};

            } else {
                ctx.state.oauth = {result: true, accessToken: accessToken, refreshToken: refreshToken, extra: others};
                next();
            }
        });
    }
};