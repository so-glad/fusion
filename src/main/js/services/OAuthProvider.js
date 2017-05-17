'use strict';

/**
 * @author palmtale
 * @since 2017/5/8.
 */


import crypto from 'crypto';
import oauth from 'oauth';
import log4js from 'koa-log4';

import cron from 'cron';

import providerActionScopes from './provider_action_scopes';
import providerUserKeys from './provider_user_keys';

import {promisefy} from '../utils';


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
                new oauth.OAuth2(provider.clientId, provider.clientSecret,
                    '',
                    provider.authorizeUrl,
                    provider.tokenUrl,
                    {}
                );
            handler.setAuthMethod(providerUserKeys[provider.type + '_' + provider.key].tokenType);
            handler.type = provider.type;
            handler.redirect = provider.redirectUrl;
            handler.userUrl = provider.userUrl;
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
        this.accessModel.create({
            type: type, client_id: handler._clientId, user_id: (user ? user.id : null),
            action: action, scope: scope, state: state, timestamp: now
        });
        params.state = state;
        params.redirect_uri = handler.redirect;
        return handler.getAuthorizeUrl(params);
    };

    getAccessTokenByCode = async (type, code, state, user) => {
        const handler = this.handlers[type];
        const where = {type: type, state: state, client_id: handler._clientId};
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
        const [accessToken, refreshToken, others] =
            await promisefy(handler, handler.getOAuthAccessToken)(code, params);
        if (!accessToken && others) {
            return others;//Some error is stored in others;
        } else {
            access.accessToken = accessToken;
            access.accessTime = others.expires_in;
            access.refreshToken = refreshToken;
            access.refreshTime = others.remind_in;
            return await access.save();
        }
    };

    getUserByAccessToken = async (type, accessToken) => {
        const keys = providerUserKeys[type];
        const handler = this.handlers[type];
        const urls = handler.userUrl.split(';');
        const handlerGetAsync = promisefy(handler, handler.get);
        if(urls.length > 1) {
            const [uidString] = await handlerGetAsync(urls[0], accessToken);
            const uidObj = JSON.parse(uidString);
            urls.shift();
            urls[0] = urls[0] + '?' + Object.keys(uidObj)[0] + '=' + Object.values(uidObj)[0];
        }
        const [userString] = await promisefy(handler, handler.get)(urls[0], accessToken);
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