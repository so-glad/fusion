'use strict';

/**
 * @author palmtale
 * @since 2017/5/2.
 */


import log4js from 'log4js';

import {OAuth2Errors, OAuth2Server, Parameter} from 'oauth2-producer';

const {UnauthorizedRequestError, InvalidGrantError} = OAuth2Errors;

const convertError = (error) => {
    const resultError = {body: {error: false, message: '', code: 200}, status: 200};
    if (error) {
        resultError.body.error = true;
        resultError.body.message = error.message;
    }
    if (error instanceof UnauthorizedRequestError) {
        resultError.status = error.status;
        resultError.body.code = error.code;
    }
    if (error instanceof InvalidGrantError
        && error.message === 'Invalid grant: user credentials are invalid') {
        resultError.status = error.status = 401;
        resultError.body.code = error.code = 401;
    }
    return resultError;
};

const transferResponse = (result, res) => {
    res.status = result.status;
    for (const header in result.headers) {
        res.header[header] = result.header(header);
    }
};

export default class KoaOAuthServer {

    delegate = null;
    logger = console;

    constructor(options) {
        this.logger = options.logger ?
            ( (typeof options.logger === 'string') ?
                log4js.getLogger(options.logger) : options.logger )
            : console;
        delete options.logger;
        this.delegate = options.delegate ?
            options.delegate : new OAuth2Server(options);
    }

    /**
     * Authorization Middleware.
     *
     * Returns a middleware that will authorize a client to request tokens.
     *
     * (See: https://tools.ietf.org/html/rfc6749#section-3.1)
     */
    authorize = async (ctx, next) => {
        const params = new Parameter(ctx.request);
        let result = null;
        try {
            result = await this.delegate.authorize(params);
        } catch (error) {
            result = convertError(error);
            this.logger.error('Oauth authorize error, cause: ' + error.message
                + ', error code: ' + error.code);
        } finally {
            transferResponse(result, ctx.response);
            ctx.state.oauth = result.body;
        }
        if (next) {
            await next(ctx);
        } else {
            return ctx;
        }
    };

    /**
     * Grant Middleware
     *
     * Returns middleware that will grant tokens to valid requests.
     *
     * (See: https://tools.ietf.org/html/rfc6749#section-3.2)
     */
    token = async (ctx, next) => {
        const params = new Parameter(ctx.request);
        let result = null;
        try {
            result = await this.delegate.token(params);
        } catch (error) {
            result = convertError(error);
            this.logger.error('Oauth token error, cause: ' + error.message
                + ', error code: ' + error.statusCode);
        } finally {
            transferResponse(result, ctx.response);
            ctx.state.oauth = result.body;
        }
        if (next) {
            await next(ctx);
        } else {
            return ctx;
        }
    };

    /**
     * Authentication Middleware.
     *
     * Returns a middleware that will validate a token.
     *
     * (See: https://tools.ietf.org/html/rfc6749#section-7)
     */
    authenticate = async (ctx, next) => {
        const params = new Parameter(ctx.request);
        let result = null;
        try {
            result = await this.delegate.authenticate(params);
        } catch (e) {
            result = convertError(e);
            this.logger.error('Oauth authenticate error, cause: ' + e.message
                + ', error code: ' + e.code);
        } finally {
            transferResponse(result, ctx.response);
            ctx.state.oauth = result.body;
        }
        if (next) {
            await next(ctx);
        } else {
            return ctx;
        }
    };

    revoke = async (ctx, next) => {
        const params = new Parameter(ctx.request);
        let result = null;
        try {
            result = await this.delegate.revoke(params.token);
        } catch (e) {
            result = convertError(e);
            this.logger.error('Oauth authenticate error, cause: ' + e.message
                + ', error code: ' + e.code);
        } finally {
            transferResponse(result, ctx.response);
            ctx.state.oauth = result.body;
        }
        if (next) {
            await next(ctx);
        } else {
            return ctx;
        }
    };
}