'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */



import log4js from 'log4js';


export default class OAuthTokenService {

    tokenModel = null;

    logger = console;

    constructor(options) {
        this.tokenModel = options.OAuthTokenModel;
        this.logger = (typeof options.logger === 'string') ? log4js.getLogger(options.logger) :
            (options.logger || this.logger);
    }

    saveToken = async (token, client, user) => {
        const savedToken = await this.tokenModel.create({
            accessToken: token.accessToken,
            expiresAt: token.accessTokenExpiresAt,
            refreshToken: token.refreshToken,
            remindAt: token.refreshTokenExpiresAt,
            user_id: user.id,
            client_id: client.clientId
        });
        this.logger.info('Saved access token [' + savedToken.accessToken + '] for client[' + client.clientId + '], user[ ' + user.id + ' ].');
        return token;
    };

    revokeToken = (token) => {
        const {OAuthToken} = this.models;
        OAuthToken.findByPrimary(token.accessToken)
            .then(accessToken => accessToken.update({revoked: true}))
            .catch(e => this.logger.error(e));
        return token;
    };

    getAccessToken = async (bearerToken) => {
        try {
            const oauthToken = await this.tokenModel.findOne({
                where: {accessToken: bearerToken},
                include: [{all: true}]});
            return {
                accessToken: oauthToken.accessToken,
                accessTokenExpiresAt: oauthToken.expiresAt,
                client: oauthToken.client,
                user: oauthToken.user,
                scope: oauthToken.scope
            };
        } catch (e) {
            this.logger.error(e);
            return false;
        }
    };

    getRefreshToken = async (bearerToken) => {
        // access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id
        try {
            const token = await this.tokenModel.findOne({
                where: {refreshToken: bearerToken},
                include: [{all: true}]});
            return {
                accessToken: token.accessToken,
                accessTokenExpiresAt: token.expiresAt,
                client: token.client,
                user: token.user,
                refreshToken: token.refreshToken,
                refreshTokenExpiresAt: token.remindAt,
                scope: token.scope
            };
        } catch (e) {
            this.logger.error(e);
            return false;
        }
    };

    verifyScope = async (token, scope) => {
        //TODO scope include logic
        if(token.scope === scope) {
            return true;
        }
        return true;
    }
}