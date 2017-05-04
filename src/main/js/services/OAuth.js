
'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */
 

import bcrypt from 'bcrypt';
import log4js from 'koa-log4';
import {models} from '../context';


const logger = log4js.getLogger('fusion');
const {User, OAuthClient, OAuthAccessToken, OAuthRefreshToken} = models;

export default class OAuthService {

    saveToken = (token, client, user) => {
        const accessToken = {id: token.accessToken, expiresAt: token.accessTokenExpiresAt, user_id: user.id, client_id: client.clientId};
        OAuthAccessToken.create(accessToken)
            .then(savedToken => {
                logger.info('Saved access token [' + savedToken.id + '] for client[' + client.clientId + '], user[ ' + user.id + ' ].');
                if(token.refreshToken) {
                    const refreshToken = {id: token.refreshToken, expiresAt: token.refreshTokenExpiresAt, access_token_id: token.accessToken};
                    return OAuthRefreshToken.create(refreshToken);
                }
            return null;
        }).then(savedRefreshToken => {
                if(savedRefreshToken){
                    logger.info('Saved refresh token [' + savedRefreshToken.id + '] for access token [' + token.accessToken + '].');
                }
        }).catch(e => logger.error(e));

        token.client = client;
        token.user = user;
        return token;
    };

    revokeToken = (token) => {
        OAuthAccessToken.findByPrimary(token.accessToken)
            .then(accessToken => accessToken.update({revoked: true}))
            .then(() => OAuthRefreshToken.findByPrimary(token.refreshToken))
            .then(refreshToken => refreshToken.update({revoked: true}))
            .catch(e => logger.error(e));
        return token;
    };

    getAccessToken = async (bearerToken) => {
        try {
            const oauthToken = await OAuthAccessToken.findOne({where: {id: bearerToken, revoked: false}})
            return {
                accessToken: oauthToken.access_token,
                clientId: oauthToken.client_id,
                expires: oauthToken.expiresAt,
                userId: oauthToken.user_id
            }
        } catch(e) {
            logger.error(e);
            return false;
        }
    };

    getRefreshToken = async (bearerToken) => {
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
            }
        } catch(e) {
            logger.error(e);
            return false;
        }
    };

    getClient = async (clientId, clientSecret) => {
        try {
            const oauthClient = await OAuthClient.findOne({where: {id: clientId, secret: clientSecret, revoked: false}});
            const grants = [];
            if((1 & oauthClient.grantTypes) === 1) {
                grants.push('password');
            }
            if((2 & oauthClient.grantTypes) === 2) {
                grants.push('client_credentials');
            }
            if((4 & oauthClient.grantTypes) === 4) {
                grants.push('refresh_token');
            }
            if((8 & oauthClient.grantTypes) === 8) {
                grants.push('authorization_code');
            }
            return {
                id: oauthClient.id,
                clientId: oauthClient.id,
                clientSecret: oauthClient.secret,
                grants: grants
            };
        } catch(e) {
            logger.error(e);
            return false;
        }
    };

    getUser = async (username, password) => {
        try {
            const user = await User.findOne({where: {$or: [{username: username}, {email: username}, {mobile: username}]}});
            if(bcrypt.compareSync(password, user.password)){
                return user;
            }
            return false;
        } catch(e) {
            logger.error(e);
            return false;
        }
    };
}