'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */



import log4js from 'koa-log4';


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
            const oauthToken = await this.tokenModel.findOne({where: {accessToken: bearerToken}});
            return {
                accessToken: oauthToken.accessToken,
                clientId: oauthToken.client_id,
                expires: oauthToken.expiresAt,
                userId: oauthToken.user_id
            };
        } catch (e) {
            this.logger.error(e);
            return false;
        }
    };

    getRefreshToken = async (bearerToken) => {
        // access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id
        try {
            const token = await this.tokenModel.findOne({where: {refreshToken: bearerToken}});
            return {
                accessToken: token.accessToken,
                accessTokenExpiresAt: token.expiresAt,
                client: await token.getClient(),
                user: await token.getUser(),
                refreshToken: bearerToken,
                refreshTokenExpiresAt: token.remindAt
            };
        } catch (e) {
            this.logger.error(e);
            return false;
        }
    };
}