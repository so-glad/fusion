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
    UnauthorizedRequestError
} from 'oauth2-server';

const handleResponse = (ctx, response) => {
    ctx.response.status = response.status;
    for (const header in response.headers) {
        ctx.response.header[header] = response.headers[header];
    }
};

const handleError = (e, ctx, response) => {
    if (response) {
        for (const header in response.headers) {
            ctx.response.header[header] = response.headers[header];
        }
    }

    if (e instanceof UnauthorizedRequestError) {
        ctx.status = e.code;
    } else {
        ctx.body = {error: e.name, error_description: e.message};
        ctx.status = e.code;
    }
    return ctx.app.emit('error', e, this);
};

export default class KoaOAuthServer {

    delegate = null;
    service = null;
    logger = console;

    constructor(options) {
        this.service = options.model;
        this.logger = options.logger ?
            ( _.isString(options.logger) ? log4js.getLogger(options.logger) : options.logger )
            : console;
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
            ctx.state.oauth = {
                code: await this.delegate.authorize(request, response)
            };

            handleResponse(response);
            await next();
        } catch (e) {
            handleError(e, response);
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
        try {
            const token = await this.delegate.token(request, response);
            const user = token.user;
            const client = token.client;
            delete token.user;
            delete token.client;
            ctx.state.oauth = {
                token: token,
                user: user,
                client: client
            };
            handleResponse(ctx, response);
            await next();
        } catch (e) {
            handleError(e, response);
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
            const user = token.user;
            const client = token.client;
            delete token.user;
            delete token.client;
            ctx.state.oauth = {
                token: token,
                user: user,
                client: client
            };
            await next();
        } catch (e) {
            handleError(e);
        }
    };

    revoke = (token) => {
        this.service.revokeToken(token);
    };
};