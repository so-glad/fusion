'use strict';

/**
 * @author palmtale
 * @since 2017/6/1.
 */

import {makeExecutableSchema} from 'graphql-tools';
import {graphqlKoa as graphQLServer} from 'graphql-server-koa';
import {graphql} from 'factors';

import GraphQLResolver from './graphql';
// const Role = {Admin: 1};

const defaultClientForGrant = (ctx, client, grant) => {
    ctx.request.body.grant_type = grant;
    ctx.request.body.client_id = client.id;
    ctx.request.body.client_secret = client.secret;
    ctx.request.query.provider = ctx.params.provider;
};
/* TODO Not required add web cookie in graphql mode,
 because 3rd login also in web mode,
 change the reverse proxy while route prefix /login */
const graphQLWebLogin = async (ctx, next) => {
    await next();
    const {data} = JSON.parse(ctx.response.body);
    const auth = data.login || data.signUp;
    if(auth) {
        if (ctx.regenerateSession) {
            await ctx.regenerateSession();
        }
        if (ctx.request.body.remember) {
            ctx.cookies.set('remember', auth.accessToken, {
                maxAge: 86400000,
                httpOnly: true,
                signed: true
            });
        }
        ctx.session.client = auth.client;
        ctx.session.user = auth.user;
    }
};

export default class Router {

    router = null;

    authenticate = null;

    get graphQLTypes() {
        return graphql.commonDef;
    }

    roleRequired = async (roleId, ctx, next) => {
        await this.authenticate(ctx);
        const user = ctx.session.user || ctx.state.oauth.user;
        if (user.role_id === roleId) {
            await next(ctx);
        } else {
            ctx.status = 403;
        }
    };

    constructor(container, router) {
        this.router = router;
        this.get = (...args) => this.router.get.apply(this.router, args);
        this.post = (...args) => this.router.post.apply(this.router, args);
        this.del = (...args) => this.router.del.apply(this.router, args);
        this.routes = () => this.router.routes.apply(this.router);
        this.allowedMethods = () => this.router.allowedMethods.apply(this.router);
        this.authenticate = container.web.auth.authenticate;

        const routerConf = container.config.router;
        if (!routerConf) {
            this.rootWeb(container.service, container.web)
                .withApi(container.service, container.api);
        } else {
            switch (routerConf.root) {
                case 'api':
                    this.rootApi(container.service, container.api);
                    break;
                case 'graphql':
                    this.rootGraphQL(container.service, container.graphql);
                    break;
                default:
                case 'web':
                    this.rootWeb(container.service, container.web);
            }
            if (routerConf.with) {
                for (const i in routerConf.with) {
                    switch (routerConf.with[i]) {
                        case 'api':
                            this.withApi(container.service, container.api, '/api');
                            break;
                        case 'graphql':
                            this.withGraphQL(container.service, container.graphql);
                    }
                }
            }
        }
    }

    rootWeb = (services, web) => {
        //TODO implement CSRF code for login.
        this.get('/login', async (ctx) => ctx.body = {message: 'Not implemented'});
        this.post('/login', async (ctx) => {
            defaultClientForGrant(ctx, web.oauth.client, 'password');
            await web.auth.login(ctx);
        });
        this.get('/login/:provider', async (ctx) => {
            if (!ctx.request.query.code && !ctx.request.query.access_token) {
                const typeKey = ctx.params.provider;
                const service = services.oauth.provider;
                const authorizeUrl = await service.generateAuthorizeUrl(typeKey, 'login');
                ctx.redirect(authorizeUrl);
            } else {
                defaultClientForGrant(ctx, web.oauth.client, 'proxy');
                await web.auth.login(ctx);
            }
        });
        this.del('/login', web.auth.logout);
        this.get('/user', async (ctx) => await web.auth.user(ctx));
        this.get('/client', async (ctx) => await web.auth.client(ctx));
        return this;
    };

    withApi = (services, api, prefix) => {
        this.post(prefix + '/authorize', async ctx => {
            await api.auth.authorize(ctx);
            ctx.body = ctx.state.oauth;
        });
        this.post(prefix + '/token', async (ctx) => {
            await api.auth.token(ctx);
            ctx.body = ctx.state.oauth.valueOf();
        });
        this.del(prefix + '/token', async (ctx) => {
            await api.auth.revoke(ctx);
            ctx.body = ctx.state.oauth;
        });
        this.get(prefix + '/:provider', async (ctx) => {
            if (!ctx.request.query.code && !ctx.request.query.access_token) {
                const typeKey = ctx.params.provider;
                const service = services.oauth.provider;
                const authorizeUrl = await service.generateAuthorizeUrl(typeKey, 'login');
                ctx.response.header['content-type'] = 'application/json;charset=utf-8';
                ctx.body = {result: true, url: authorizeUrl, type: typeKey};
            } else {
                defaultClientForGrant(ctx, api.oauth.client, 'proxy');
                await api.auth.token(ctx);
                ctx.body = ctx.state.oauth.valueOf();
            }
        });
        return this;
    };

    rootApi = (services, api) => {
        return this.withApi(services, api, '');
    };

    graphQLMiddleware = (services, graphql) => {
        if (!services) {
            throw new Error('No services for graphql resolver');
        }
        const graphQLResolver = new GraphQLResolver(services);
        if (graphql.resolvers) {
            graphQLResolver.combine(graphql.resolvers);
        }
        const graphQLSchema = makeExecutableSchema({typeDefs: this.graphQLTypes, resolvers: graphQLResolver.get()});
        return graphQLServer(async ctx => {
            await this.authenticate(ctx);
            const {user} = Object.assign({}, ctx.session, ctx.state.oauth);
            return {schema: graphQLSchema, context: {user: user, client: graphql.oauth.client}};
        });
    };

    rootGraphQL = (services, graphql) => {
        const middleware = this.graphQLMiddleware(services, graphql);
        this.get('/', middleware);
        this.post('/', middleware);
        return this;
    };

    withGraphQL = (services, graphql) => {
        const middleware = this.graphQLMiddleware(services, graphql);
        this.get('/graphql', graphQLWebLogin, middleware);
        this.post('/graphql', graphQLWebLogin, middleware);
        return this;
    };

}