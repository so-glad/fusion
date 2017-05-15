'use strict';

/**
 * @author palmtale
 * @since 2017/5/2.
 */


import _ from 'lodash';
import log4js from 'koa-log4';

import NodeOAuthServer, {
    Request,
    Response,
    UnauthorizedRequestError,
    InvalidGrantError
} from 'oauth2-server';


const convertToken = (token) => {
    if (!token) {
        return {};
    }
    const user = token.user;
    const client = token.client;
    delete token.user;
    delete token.client;
    return {
        token: token,
        user: user,
        client: client
    };
};

const convertError = (error) => {
    const resultError = {};
    if (error) {
        resultError.error = true;
        resultError.message = error.message;
    }
    if (error instanceof UnauthorizedRequestError) {
        resultError.status = error.status;
        resultError.code = error.code;
    }
    if (error instanceof InvalidGrantError
        && error.message === 'Invalid grant: user credentials are invalid') {
        resultError.status = error.status = 401;
        resultError.code = error.code = 401;
        resultError.statusCode = error.statusCode = 401;
    }
    return resultError;
};

const transferResponse = (response, res) => {
    res.status = response.status;
    for (const header in response.headers) {
        res.header[header] = response.headers[header];
    }
};

export default class KoaOAuthServer {

    delegate = null;
    service = null;
    logger = console;

    constructor(options) {
        this.service = options.service;
        this.logger = options.logger ?
            ( _.isString(options.logger) ? log4js.getLogger(options.logger) : options.logger )
            : console;
        options.model = options.service;
        delete options.logger;
        this.delegate = new NodeOAuthServer(options);
    }

    /**
     * Authorization Middleware.
     *
     * Returns a middleware that will authorize a client to request tokens.
     *
     * (See: https://tools.ietf.org/html/rfc6749#section-3.1)
     */
    authorize = async (ctx, next) => {
        const request = new Request(ctx.request);
        const response = new Response(ctx.res);
        try {
            const code = await this.delegate.authorize(request, response);
            transferResponse(response, ctx.response);
            if (next) {
                ctx.state.oauth = {
                    code: code
                };
                await next();
            } else {
                ctx.res.header('content-type', 'application/json; charset=UTF-8');
                ctx.res.body = {code: code};
            }
        } catch (e) {
            this.logger.error(e);
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
        const request = new Request(ctx.request);
        const response = new Response(ctx.res);
        let result = null;
        try {
            const token = await this.delegate.token(request, response);
            result = convertToken(token);
        } catch (error) {
            result = convertError(error);
            response.status = result.status;
            this.logger.error('Oauth token error, cause: ' + error.message
                + ', error code: ' + error.statusCode);
        } finally {
            transferResponse(response, ctx.response);
            if (next) {
                ctx.state.oauth = result;
                await next();
            } else {
                ctx.response.header['content-type'] = 'application/json; charset=UTF-8';
                ctx.body = result;
            }
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
        const request = new Request(ctx.request);
        try {
            const token = await this.delegate.authenticate(request);
            if (next) {
                ctx.state.oauth = convertToken(token);
                await next();
            } else {
                ctx.res.header('content-type', 'application/json; charset=UTF-8');
                ctx.res.body = convertToken(token);
            }
        } catch (e) {
            this.logger.error(e);
        }
    };

    revoke = (token) => {
        this.service.revokeToken(token);
    };
}