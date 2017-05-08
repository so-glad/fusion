
'use strict';

/**
 * @author palmtale
 * @since 2017/5/8.
 */
 
 
export default class OAuthProviderService {

    oauthClient = null;

    models = null;

    handlers = null;

    constructor({models, oauthClient, handlers}) {
        this.models = models;
        this.oauthClient = oauthClient;
        this.handlers = handlers;
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