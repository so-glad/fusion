'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */


import bcrypt from 'bcrypt';
import log4js from 'koa-log4';


const grantTypes = (value) => {
    const grants = [];
    if ((1 & value) === 1) {
        grants.push('authorization_code');
    }
    if ((2 & value) === 2) {
        grants.push('password');
    }
    if ((4 & value) === 4) {
        grants.push('client_credentials');
    }
    if ((8 & value) === 8) {
        grants.push('implicit');
    }
    if ((16 & value) === 8) {
        grants.push('refresh_token');
    }
    return grants;
};

export default class OAuthServerService {

    models = null;
    logger = console;

    constructor(models, logging) {
        this.models = models;
        this.logger = logging ? log4js.getLogger(logging) : this.logger;
    }

    saveToken = (token, client, user) => {
        const {OAuthAccessToken, OAuthRefreshToken} = this.models;
        const accessToken = {
            id: token.accessToken,
            expiresAt: token.accessTokenExpiresAt,
            user_id: user.id,
            client_id: client.clientId
        };
        OAuthAccessToken.create(accessToken)
            .then(savedToken => {
                this.logger.info('Saved access token [' + savedToken.id + '] for client[' + client.clientId + '], user[ ' + user.id + ' ].');
                if (token.refreshToken) {
                    const refreshToken = {
                        id: token.refreshToken,
                        expiresAt: token.refreshTokenExpiresAt,
                        access_token_id: token.accessToken
                    };
                    return OAuthRefreshToken.create(refreshToken);
                }
                return null;
            }).then(savedRefreshToken => {
                if (savedRefreshToken) {
                    this.logger.info('Saved refresh token [' + savedRefreshToken.id + '] for access token [' + token.accessToken + '].');
                }
            }).catch(e => this.logger.error(e));

        token.client = client;
        token.user = user;
        return token;
    };

    revokeToken = (token) => {
        const {OAuthAccessToken, OAuthRefreshToken} = this.models;
        OAuthAccessToken.findByPrimary(token.accessToken)
            .then(accessToken => accessToken.update({revoked: true}))
            .then(() => OAuthRefreshToken.findByPrimary(token.refreshToken))
            .then(refreshToken => refreshToken.update({revoked: true}))
            .catch(e => this.logger.error(e));
        return token;
    };

    getAccessToken = async (bearerToken) => {
        const {OAuthAccessToken} = this.models;
        try {
            const oauthToken = await OAuthAccessToken.findOne({where: {id: bearerToken, revoked: false}});
            return {
                accessToken: oauthToken.access_token,
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
        const {OAuthRefreshToken} = this.models;
        // access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id
        try {
            const refreshToken = await OAuthRefreshToken.findByPrimary(bearerToken);
            const accessToken = await refreshToken.getAccessToken();
            return {
                accessToken: accessToken.id,
                accessTokenExpiresAt: accessToken.expires_at,
                client: await accessToken.getClient(),
                user: await accessToken.getUser(),
                refreshToken: bearerToken,
                refreshTokenExpiresAt: refreshToken.expires_at,
            };
        } catch (e) {
            this.logger.error(e);
            return false;
        }
    };

    getClient = async (clientId, clientSecret) => {
        const {OAuthClient} = this.models;
        try {
            const oauthClient = await OAuthClient.findOne({
                where: {
                    id: clientId,
                    secret: clientSecret,
                    revoked: false
                }
            });
            return {
                id: oauthClient.id,
                clientId: oauthClient.id,
                clientSecret: oauthClient.secret,
                grants: grantTypes(oauthClient.grantTypes)
            };
        } catch (e) {
            this.logger.error(e);
            return false;
        }
    };

    getClientById = async (clientId) => {
        const {OAuthClient} = this.models;
        try {
            const client = await OAuthClient.findByPrimary(clientId);
            client.grantTypes = grantTypes(client.grantTypes);
            return {
                id: client.id,
                clientId: client.id,
                clientSecret: client.secret,
                grants: grantTypes(client.grantTypes)
            };
        } catch (e) {
            this.logger.error(e);
            return false;
        }
    };

    getUser = async (username, password) => {
        const {User} = this.models;
        try {
            const user = await User.findOne({where: {$or: [{username: username}, {email: username}, {mobile: username}]}});
            if (bcrypt.compareSync(password, user.password)) {
                return {
                    id: user.id,
                    username: user.username,
                    alias: user.alias,
                    avatar: user.avatar,
                    email: user.email,
                    mobile: user.mobile,
                    rememberToken: user.rememberToken,
                    createdAt: user.created_at,
                    updatedAt: user.updated_at
                };
            }
            return false;
        } catch (e) {
            this.logger.error(e);
            return false;
        }
    };
}