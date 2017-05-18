'use strict';

/**
 * @author palmtale
 * @since 2017/5/8.
 */


import crypto from 'crypto';
import log4js from 'koa-log4';
import cron from 'cron';

import OAuth2 from '../client/OAuth2';
import providerActionScopes from './provider_action_scopes';
import providerUserKeys from './provider_user_keys';

export default class OAuthProviderService {

    accessModelClass = null;

    providerUserModels = [];

    localUserModel = null;

    handlers = [];

    logger = console;

    constructor(options) {
        this.logger = options.logger ? log4js.getLogger(options.logger) : this.logger;
        this.localUserModel = options.localUserModel;

        this.accessModelClass = options.accessModelClass;
        new cron.CronJob('0 0 0 * * *', () => {
            this.accessModel =
                new this.accessModelClass({tableName: 'oauth_provider_access_' + new Date().format('yyyyMMdd')});
        }, () => {
        }, true, 'Asia/Shanghai', null, true);

        const userModelClass = options.userModelClass;
        for (const index in options.providers) {
            const provider = options.providers[index];
            if(!this.providerUserModels[provider.type]){
                this.providerUserModels[provider.type] =
                    new userModelClass({tableName: 'oauth_provider_user_' + provider.type});
            }
            const handler = this.handlers[provider.type + '_' + provider.key] =
                new OAuth2(provider.clientId, provider.clientSecret,
                    '',
                    provider.authorizeUrl,
                    provider.tokenUrl);
            handler.type = provider.type;
            handler.key = provider.key;
            handler.redirectUri = provider.redirectUrl;
            handler.userUrl = provider.userUrl;
        }
    }

    generateAuthorizeUrl = async (typeKey, action, user) => {
        const handler = this.handlers[typeKey];
        if (!handler) {
            this.logger.error('No handler for type ' + typeKey);
            return null;
        }
        const params = {};
        const scope = providerActionScopes[handler.type][action];
        if (scope) {
            params.scope = scope;
        }
        const now = new Date();
        //TODO random gen state for user and store
        const state = crypto.createHash('sha256')
            .update((user ? user.id : '') + action + scope + now.getTime(), 'utf8').digest('hex');
        this.accessModel.create({
            type: typeKey, client_id: handler._clientId, user_id: (user ? user.id : null),
            action: action, scope: scope, state: state, timestamp: now
        });
        params.state = state;
        params.redirect_uri = handler.redirectUri;
        return handler.getAuthorizeUrl(params);
    };

    getAccessTokenByCode = async (typeKey, code, state, user) => {
        const handler = this.handlers[typeKey];
        const where = {type: typeKey, state: state, client_id: handler._clientId};
        if (user) {
            where.user_id = user.id;
        }
        const access = await this.accessModel.findOne({where: where});
        if (access.timestamp + 60 * 1000 < new Date()) {//expired
            return {error: 'Action state expired'};
        }

        const params = {};
        if (state) {
            params.state = state;
        }
        params.redirect_uri = handler.redirect;
        params.code = code;
        const [result,] =
            await handler.getOAuthAccessToken(params);
        if (result.error) {
            return result;//Some error is stored in others;
        } else {
            access.accessToken = result.access_token || result.accessToken;
            access.accessTime = result.expires_in;
            access.refreshToken = result.refresh_token;
            access.refreshTime = result.remind_in;
            access.userId = result.uid || result.openid || result.userId || result.user_id;
            await access.save();
            const key = result.uid ? 'uid' : result.openid ? 'openid' : result.userId ? 'userId' : result.user_id ? 'user_id' : '';
            access.params = () => ({access_token: access.accessToken, [key]: access.userId});
            return access;

        }
    };

    getUserByAccessToken = async (type, access) => {
        const handler = this.handlers[type];
        const keys = providerUserKeys[handler.type];
        const [userString] = await handler.get(handler.userUrl, access);
        const user = JSON.parse(userString);
        const clientUserKeySingleJson = {};
        clientUserKeySingleJson[handler._clientId] = user[keys.clientUserKey];
        const [providerUser, created] = await this.providerUserModels[handler.type].findOrCreate({
            where: {providerUserKey: user[keys.providerUserKey] + ''}, defaults: {
                clientUserKeys: clientUserKeySingleJson,
                username: user[keys.username],
                payload: user
            }
        });
        if (created) {
            const localUser = await this.localUserModel.create({
                username: providerUser.username,
                password: type,
                avatar: user[keys.avatar],
                alias: user[keys.alias]
            });
            providerUser.user_id = localUser.id;
            await providerUser.save();
            return localUser;
        } else {
            providerUser.clientUserKeys[handler._clientId] = user[keys.clientUserKey];
            await providerUser.save();
            return await providerUser.getUser();
        }
    }
}