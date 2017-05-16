'use strict';

/**
 * @author palmtale
 * @since 2017/5/8.
 */


import oauth from 'oauth';
import log4js from 'koa-log4';

import {promisefy} from '../utils';

export default class OAuthProviderService {

    models = null;
    handlers = [];
    stateCache = null;
    logger = console;

    constructor(options) {
        this.models = options.models;
        this.logger = options.logger ? log4js.getLogger(options.logger) : this.logger;
        this.stateCache = options.store;
        for(const index in options.providers) {
            const provider = options.providers[index];
            this.handlers[provider.type] = new oauth.OAuth2(provider.clientId, provider.clientSecret,
                '',
                provider.authorizeUrl,
                provider.tokenUrl,
                {});
        }
    }

    generateAuthorizeUrl = (type, scope, user) => {
        const handler = this.handlers[type];
        if(!handler) {
            this.logger.error('No handler for type ' + type);
            return null;
        }
        const params = {};
        if(scope) {
            params.scope = scope;
        }
        if(user) {
            const state = 'wfdnzcfda';//TODO random gen state for user and store
            this.stateCache.set(state, user.id, 60*1000);
            params.state = state;
        }
        return handler.getAuthorizeUrl(params);
    };

    verifyState = (state, user) => {
        //TODO verify state via state and user
        const userId = this.stateCache.get(state);
        return userId === user.id;
    };

    getAccessTokenByCode = async (type, code, state) => {
        const handler = this.handlers[type];
        const params = {};
        if(state) {
            params.state = state;
        }
        const [accessToken, , others] = await promisefy(handler, handler.getOAuthAccessToken)(code, params);
        //TODO store accessToken
        if(!accessToken && others) {
            return others;//Some error is stored in others;
        }
        return accessToken;
    };
}