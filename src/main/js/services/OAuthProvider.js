'use strict';

/**
 * @author palmtale
 * @since 2017/5/8.
 */


import crypto from 'crypto';
import oauth from 'oauth';
import log4js from 'koa-log4';

import providerUrl from './provider_urls';
import providerActionScopes from './provider_action_scopes';
import providerUserKeys from './provider_user_keys';

import {promisefy} from '../utils';


export default class OAuthProviderService {

    accessModelClass = null;
    providerUserModels = [];
    localUserModel = null;
    handlers = [];
    logger = console;

    get accessModel() {
        return new this.accessModelClass({tableName: 'oauth_provider_access_' + new Date().format('yyyyMMdd')});
    }

    constructor(options) {
        this.accessModelClass = options.accessModelClass;
        this.localUserModel = options.localUserModel;
        this.logger = options.logger ? log4js.getLogger(options.logger) : this.logger;

        const userModelClass = options.userModelClass;
        for (const index in options.providers) {
            const provider = options.providers[index];
            this.handlers[provider.type] = new oauth.OAuth2(provider.clientId, provider.clientSecret,
                '',
                providerUrl[provider.type].authorize,
                providerUrl[provider.type].token,
                {});
            this.providerUserModels[provider.type] =
                new userModelClass({tableName: 'oauth_provider_user_' + provider.type});
        }
    }

    generateAuthorizeUrl = async (type, action, user) => {
        const handler = this.handlers[type];
        if (!handler) {
            this.logger.error('No handler for type ' + type);
            return null;
        }
        const params = {};
        const scope = providerActionScopes[type][action];
        if (scope) {
            params.scope = scope;
        }
        const now = new Date();
        //TODO random gen state for user and store
        const state = crypto.createHash('sha256')
            .update((user ? user.id : '') + action + scope + now.getTime(), 'utf8').digest('hex');
        const AccessModel = await this.accessModel.connect();
        AccessModel.create({
            type: type, client_id: handler._clientId, user_id: (user ? user.id : null),
            action: action, scope: scope, state: state, timestamp: now
        });
        params.state = state;
        return handler.getAuthorizeUrl(params);
    };

    getAccessTokenByCode = async (type, code, state, user) => {
        const handler = this.handlers[type];
        const where = {type: type, state: state, client_id: handler._clientId};
        if (user) {
            where.user_id = user.id;
        }
        const AccessModel = await this.accessModel.connect();
        const access = await AccessModel.findOne({where: where});
        if (access.timestamp + 60 * 1000 < new Date()) {//expired
            return {error: 'Action state expired'};
        }

        const params = {};
        if (state) {
            params.state = state;
        }
        const [accessToken, refreshToken, others] =
            await promisefy(handler, handler.getOAuthAccessToken)(code, params);
        if (!accessToken && others) {
            return others;//Some error is stored in others;
        } else {
            access.accessToken = accessToken;
            // access.accessTime = others.accessTokenExpiresAt;
            access.refreshToken = refreshToken;
            // access.refreshTime = others.refreshTokenExpiresAt;
            return await access.save();
        }
    };

    getUserByAccessToken = async (type, accessToken) => {
        const keys = providerUserKeys[type];
        const handler = this.handlers[type];
        const [userString] = await promisefy(handler, handler.get)(providerUrl[type].user, accessToken);
        const user = JSON.parse(userString);
        const clientUserKeySingleJson = {};
        clientUserKeySingleJson[handler._clientId] = user[keys.clientUserKey];
        const [providerUser, created] = await this.providerUserModels[type].findOrCreate({
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
            return await providerUser.getUser();
        }
    }
}