
'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */
 

import log4js from 'koa-log4';
import {models} from '../context';


const logger = log4js.getLogger('fusion');
const {User, OAuthClient, OAuthAccessToken, OAuthRefreshToken} = models;

class OAuthService {

    saveAccessToken = async (token, client, user) => {
        try {
            const accessToken = {id: token.accessToken, expires_at: token.accessTokenExpiresOn, user_id: user.id, client_id: client.id};
            const accessTokenModel = await OAuthAccessToken.create(accessToken);
            if(!accessTokenModel) {
                return false;
            }
            if(token.refreshToken) {
                const refreshToken = {id: token.refreshToken, expiresAt: token.refreshTokenExpiresOn, access_token_id: token.accessToken};
                return await OAuthRefreshToken.create(refreshToken);
            }
            return accessTokenModel;
        } catch(e) {
            logger.error(e);
            return false;
        }
    };

    getAccessToken = async (bearerToken) => {
        try {
            const oauthToken = await OAuthAccessToken.findOne({where: {id: bearerToken}})
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
            const refreshToken = await OAuthRefreshToken.findOne({where: {access_token_id: bearerToken}});
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

    getClient = async (clientId, clientSecret) => {
        try {
            const oauthClient = await OAuthClient.findOne({where: {id: clientId, secret: clientSecret}});
            return {
                clientId: oauthClient.id,
                clientSecret: oauthClient.secret
            };
        } catch(e) {
            logger.error(e);
            return false;
        }
    };

    getUser = async (username, password) => {
        try {
            const user = User.findOne({where: {$or: [{username: username}, {email: username}, {mobile: username}]}});
            return user;
        } catch(e) {
            logger.error(e);
            return false;
        }
    };
}