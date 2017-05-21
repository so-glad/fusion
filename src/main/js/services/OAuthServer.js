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
        grants.push('proxy');
    }
    if ((16 & value) === 16) {
        grants.push('refresh_token');
    }
    return grants;
};

export default class OAuthServerService {

    models = null;

    logger = console;

    constructor(options) {
        this.models = options.models;
        this.logger = options.logger ? log4js.getLogger(options.logger) : this.logger;
    }

    saveToken = (token, client, user) => {
        const {OAuthToken} = this.models;
        OAuthToken.create({
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
            remindAt: token.refreshTokenExpiresAt,
            expiresAt: token.accessTokenExpiresAt,
            user_id: user.id,
            client_id: client.clientId
        }).then(savedToken =>
            this.logger.info('Saved access token [' + savedToken.accessToken + '] for client[' + client.clientId + '], user[ ' + user.id + ' ].')
        ).catch(e =>
            this.logger.error(e)
        );
        token.client = client;
        token.user = user;
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
        const {OAuthToken} = this.models;
        try {
            const oauthToken = await OAuthToken.findOne({where: {accessToken: bearerToken, revoked: false}});
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
        const {OAuthToken} = this.models;
        // access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id
        try {
            const token = await OAuthToken.findOne({where: {refreshToken: bearerToken}});
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
            if (user && bcrypt.compareSync(password, user.password)) {
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

    saveAuthorizationCode = async (code, client, user) => {
        const {OAuthCode} = this.models;
        return await OAuthCode.create({id: code, user_id: user.id, client_id: client.id});
    };
}