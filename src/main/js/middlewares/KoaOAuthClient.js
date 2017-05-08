
'use strict';

/**
 * @author palmtale
 * @since 2017/5/8.
 */


export default class KoaOAuthClient {

    service = null;

    constructor(options) {
        this.service = options.service;
    }

    getAuthorizeUrl = async (ctx, next) => {
        //TODO Get provider type from ctx;
        const type = ctx.path.type;
        const clientId = ctx.request.path.client;
        const provider =  await this.service.findProvider(type, clientId);
        delete provider.clientSecret;
        //TODO Add random state and define required scope then saved into mem store.
        if(!next) {
            ctx.json(provider);
        } else {
            ctx.state.oauth = {
                provider: provider
            };
            await next();
        }
    };

    getUserAuthorizedByCode = async (ctx, next) => {
        //TODO Verify state.
        try{
            const user = await this.service.connectProviderUser(type, ctx.request.path.clientId, ctx.request.path.code);
            delete user.password;
            delete user.salt;
            ctx.state.oauth = {
                token: {user: user, client: null},
                client: null
            }

        } catch(e){

        } finally {
            await next();
        }
    }
};