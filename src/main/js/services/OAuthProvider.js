'use strict';

/**
 * @author palmtale
 * @since 2017/5/8.
 */


import log4js from 'koa-log4';

export default class OAuthProviderService {

    models = null;

    logger = console;

    constructor(options) {
        this.models = options.models;
        this.logger = options.logger ? log4js.getLogger(options.logger) : this.logger;
    }

    findProvider = async (type, client) => {
        const {OAuthProvider} = this.models;
        return await OAuthProvider.findOne({where: {type: type, clientId: client}});
    };

    connectProviderUser = async (type, client, code) => {
        const provider = await this.findProvider(type, client);
        /* clientId, clientSecret, baseSite, authorizePath, accessTokenPath, customHeaders */
        const providerClient = new this.oauthClient.OAuth2(provider.clientId, provider.clientSecret,
            'https://api.twitter.com/',
            provider.authorizeUrl,
            provider.tokenUrl,
            {});

        const accessToken = await providerClient.getOAuthAccessToken(code, {});
        const handler = this.handlers[type];
        //TODO To connect provider via provider.tokenUrl, and sync user info locally.
        return await handler.getUser(accessToken);
    }
}