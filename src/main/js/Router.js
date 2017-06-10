'use strict';

/**
 * @author palmtale
 * @since 2017/6/1.
 */

import {makeExecutableSchema} from 'graphql-tools';
import graphQLServer from 'graphql-server-koa';
import {graphql} from 'factors';

import GraphQLResolver from './graphql';
// const Role = {Admin: 1};

const defaultClientForGrant = (ctx, client, grant) => {
    ctx.request.body.grant_type = grant;
    ctx.request.body.client_id = client.id;
    ctx.request.body.client_secret = client.secret;
    ctx.request.query.provider = ctx.params.provider;
};

export default class Router {

    router = null;

    authenticate = null;

    roleRequired = async (roleId, ctx, next) => {
        await this.authenticate(ctx);
        const user = ctx.session.user || ctx.state.oauth.user;
        if(user.role_id === roleId) {
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
        if(!routerConf) {
            this.rootWeb(container.service, container.web)
                .withApi(container.service, container.api);
        } else {
            switch(routerConf.root) {
                case 'api':
                    this.rootApi(container.service, container.api);
                    break;
                case 'graphql':
                    this.rootGraphQL(container.service, container.graphql.resolvers);
                    break;
                default:
                case 'web':
                    this.rootWeb(container.service, container.web);
            }
            if(routerConf.with){
                for(const i in routerConf.with){
                    switch (routerConf.with[i]){
                        case 'api':
                            this.withApi(container.service, container.api);
                            break;
                        case 'graphql':
                            this.withGraphQL(container.service, container.graphql.resolvers);
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
            if(!ctx.request.query.code && !ctx.request.query.access_token) {
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

    rootApi = (services, api) => {
        this.post('/authorize', async ctx => {
            await api.auth.authorize(ctx);
            ctx.body = ctx.state.oauth;
        });
        this.post('/token', async (ctx) => {
            await api.auth.token(ctx);
            ctx.body = ctx.state.oauth.valueOf();
        });
        this.del('/token', async (ctx) => {
            await api.auth.revoke(ctx);
            ctx.body = ctx.state.oauth;
        });
        this.get('/:provider', async (ctx) => {
            if(!ctx.request.query.code && !ctx.request.query.access_token) {
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
    };

    withApi = (services, api) => {
        //TODO The code redundance.
        this.post('/oauth/authorize', async ctx => {
            await api.auth.authorize(ctx);
            ctx.body = ctx.state.oauth;
        });
        this.post('/oauth/token', async (ctx) => {
            await api.auth.token(ctx);
            ctx.body = ctx.state.oauth.valueOf();
        });
        this.del('/oauth/token', async (ctx) => {
            await api.auth.revoke(ctx);
            ctx.body = ctx.state.oauth;
        });
        this.get('/oauth/:provider', async (ctx) => {
            if(!ctx.request.query.code && !ctx.request.query.access_token) {
                const typeKey = ctx.params.provider;
                const service = services.oauth.provider;
                const authorizeUrl = await service.generateAuthorizeUrl(typeKey, 'login');
                ctx.response.header['content-type'] = 'application/json;charset=utf-8';
                ctx.body = {result: true, url: authorizeUrl, type: typeKey};
            } else {
                defaultClientForGrant(ctx, apis.oauth.client, 'proxy');
                await apis.auth.token(ctx);
                ctx.body = ctx.state.oauth.valueOf();
            }
        });
    };

    graphQLMiddleware = (services, resolvers) => {
        if(!services) {
            throw new Error('No services for graphql resolver');
        }
        const graphQLResolver = new GraphQLResolver(services);
        if(resolvers) {
            graphQLResolver.combine(resolvers);
        }
        const graphQLSchema = makeExecutableSchema({typeDefs: graphql, resolvers: graphQLResolver.get()});
        return graphQLServer(async ctx => {
            await this.authenticate(ctx);
            ctx.state.oauth = ctx.state.oauth || {};
            return {schema: graphQLSchema, context: {user: ctx.state.oauth.user}};
        });
    };

    rootGraphQL = (services, resolvers) => {
        const middleware = this.graphQLMiddleware(services, resolvers);
        this.get('/', middleware);
        this.post('/', middleware);
        return this;
    };

    withGraphQL = (services, resolvers) => {
        const middleware = this.graphQLMiddleware(services, resolvers);
        this.get('/graphql', middleware);
        this.post('/graphql', middleware);
    };

}