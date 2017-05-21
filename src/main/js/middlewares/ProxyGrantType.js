'use strict';

/**
 * @author palmtale
 * @since 2017/5/19.
 */


import AbstractGrantType from 'oauth2-server/lib/grant-types/abstract-grant-type';
import InvalidArgumentError from 'oauth2-server/lib/errors/invalid-argument-error';
import InvalidGrantError from 'oauth2-server/lib/errors/invalid-grant-error';
import UnauthorizedRequestError from 'oauth2-server/lib/errors/unauthorized-request-error';


export default class ProxyGrantType extends AbstractGrantType {

    service = null;

    constructor(options) {
        super(options);
        options = options || {};
        this.service = options.model;
        if (!this.service) {
            throw new InvalidArgumentError('Missing parameter: `model`');
        }

        if (!this.service.exchangeAccessTokenByCode) {
            throw new InvalidArgumentError('Invalid argument: model does not implement `exchangeAccessTokenByCode()`');
        }

        if (!this.service.getUserByAccessToken) {
            throw new InvalidArgumentError('Invalid argument: model does not implement `getUserByAccessToken()`');
        }

        if (!this.service.saveToken) {
            throw new InvalidArgumentError('Invalid argument: model does not implement `saveToken()`');
        }
    }

    handle = async (request, client) => {
        if (!request) {
            throw new InvalidArgumentError('Missing parameter: `request`');
        }

        if (!client) {
            throw new InvalidArgumentError('Missing parameter: `client`');
        }

        const scope = this.getScope(request);
        const user = await this.getUser(request);
        return await this.saveToken(user, client, scope);
    };

    getUser = async (request) => {
        const typeKey = request.body.provider;
        if (request.body.error) {
            throw new InvalidGrantError();
        }
        const state = request.body.state;
        const code = request.body.code;
        const accessToken = request.body.access_token;

        let accessParams = null;
        if (code) {
            const access = await this.service.exchangeAccessTokenByCode(typeKey, code, state);
            if (access.error) {
                throw (typeof access.error === 'string') ? new UnauthorizedRequestError(access.error) :
                    access.error;
            }
            accessParams = access.params();
        } else if (accessToken) {
            accessParams = {access_token: accessToken};
        } else {
            throw new InvalidArgumentError();
        }
        const user = await this.service.getUserByAccessToken(typeKey, accessParams);
        if (!user || !user.id) {
            throw new Error('Cannot get user via accessToken');
        }
        return user;
    };

    saveToken = async (user, client, scope) => {
        const validatedScope = await this.validateScope(user, client, scope);
        const accessToken = await this.generateAccessToken(client, user, validatedScope);
        const refreshToken = await this.generateRefreshToken(client, user, validatedScope);
        const accessTokenExpiresAt = this.getAccessTokenExpiresAt();
        const refreshTokenExpiresAt = this.getRefreshTokenExpiresAt();

        const token = {
            accessToken: accessToken,
            accessTokenExpiresAt: accessTokenExpiresAt,
            refreshToken: refreshToken,
            refreshTokenExpiresAt: refreshTokenExpiresAt,
            scope: validatedScope
        };

        return await this.service.saveToken(token, client, user);
    }

}