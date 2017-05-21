'use strict';

/**
 * @author palmtale
 * @since 2017/5/7.
 */


import log4js from 'koa-log4';
import Sequelize from 'sequelize';
//Models classes
import UserAgentClass from './models/UserAgent';

import RoleClass from './models/Role';
import UserClass from './models/User';

import OAuthClientClass from './models/OAuthClient';
import OAuthCodeClass from './models/OAuthCode';
import OAuthTokenClass from './models/OAuthToken';

import OAuthProviderClass from './models/OAuthProvider';
import OAuthProviderAccessClass from './models/OAuthProviderAccess';
import OAuthProviderUserClass from './models/OAuthProviderUser';
//Services
import OAuthServerService from './services/OAuthServer';
import OAuthProviderService from './services/OAuthProvider';
//Server Middleware
import KoaOAuthServer from './middlewares/KoaOAuthServer';
import KoaBrowserAuth from './middlewares/KoaBrowserAuth';
//Extra
import KoaUserAgent from './middlewares/KoaUserAgent';
import Context from './Context';


const configDatabase = (databases) => {
    const result = {};
    for (const database in databases) {
        const dataConfig = databases[database];
        if (dataConfig.dialect !== 'postgres' && dataConfig.dialect !== 'mysql') {
            continue;
        }
        const dbLogger = log4js.getLogger(dataConfig.logging);
        result[database] = new Sequelize(dataConfig.name,
            dataConfig.username, dataConfig.password, {
                dialect: dataConfig.dialect,
                host: dataConfig.host,
                port: dataConfig.port,
                pool: {
                    max: 8,
                    min: 3,
                    idle: 10000
                },
                logging: msg => dbLogger.info.apply(dbLogger, [msg])
            });
        result[database].logger = dbLogger;
    }
    return result;
};

const configModels = (databases) => {
    const Role = new RoleClass(databases.common, {});

    UserClass.addBelongTo(Role.delegate, 'role', 'role_id');
    const User = new UserClass(databases.common, {});
    const UserAgent = new UserAgentClass(databases.common, {});
    OAuthClientClass.addBelongTo(User.delegate, 'user', 'user_id');
    const OAuthClient = new OAuthClientClass(databases.common, {});

    OAuthCodeClass.addBelongTo(User.delegate, 'user', 'user_id');
    OAuthCodeClass.addBelongTo(OAuthClient.delegate, 'client', 'client_id');
    const OAuthCode = new OAuthCodeClass(databases.common, {});

    OAuthTokenClass.addBelongTo(User.delegate, 'user', 'user_id');
    OAuthTokenClass.addBelongTo(OAuthClient.delegate, 'client', 'client_id');
    const OAuthAccessToken = new OAuthTokenClass(databases.common, {});

    const OAuthProvider = new OAuthProviderClass(databases.common, {});
    OAuthProviderAccessClass.addBelongTo(User.delegate, 'user', 'user_id');
    OAuthProviderAccessClass.addBelongTo(OAuthProvider.delegate, 'providerClient', 'client_id');
    OAuthProviderUserClass.addBelongTo(User.delegate, 'user', 'user_id');

    return {
        UserAgent: UserAgent,

        Role: Role,
        User: User,

        OAuthClient: OAuthClient,
        OAuthCode: OAuthCode,
        OAuthToken: OAuthAccessToken,

        OAuthProvider: OAuthProvider,
        OAuthProviderAccess: (options) =>
            new OAuthProviderAccessClass(databases.common, options || {}),
        OAuthProviderUser: (options) =>
            new OAuthProviderUserClass(databases.common, options || {})
    };
};

const configOAuthClients = async (clientConfig, providerModel) => {
    let providers = [];
    for (const type in clientConfig) {
        const clients = clientConfig[type];
        const pros = await providerModel.findAll({where: {type: type, clientId: Object.values(clients)}});
        for (const key in clients) {
            for (const i in pros) {
                if (clients[key] === pros[i].clientId) {
                    pros[i].key = key;
                }
            }
        }
        providers = providers.concat(pros);
    }
    return providers;
};

export default class Container extends Context {

    constructor(config) {
        super(config);
        log4js.configure(this.config.log4js, {cwd: this.config.log4js.cwd});
        const defaultLogging = this.config.log4js.appenders[0].category;
        const databases = configDatabase(this.config.databases);
        const models = configModels(databases);

        this.register('models', models)
            .register('input.agent', new KoaUserAgent(models, defaultLogging));
    }

    heatUp = async () => {
        const defaultLogging = this.config.log4js.appenders[0].category;
        const models = this.module('models');
        const config = this.config;
        const client = await models.OAuthClient.findOne({where: {id: config.client.web}});
        const providers = await configOAuthClients(config.client, models.OAuthProvider);
        const oauthServerService = new OAuthServerService({
            models: models,
            logger: defaultLogging
        });
        const oauthProviderService = new OAuthProviderService({
            accessModelClass: models.OAuthProviderAccess,
            userModelClass: models.OAuthProviderUser,
            localUserModel: models.User,
            logger: defaultLogging,
            providers: providers
        });
        const oauthService = Object.assign({}, oauthServerService, oauthProviderService);
        const koaOAuthServer = new KoaOAuthServer({
            debug: false,
            service: oauthService,
            logger: defaultLogging
        });
        this.register('oauth.client.web', client)
            .register('service.auth.client', oauthService)
            .register('service.auth.server', oauthService)
            .register('api.auth.server', koaOAuthServer)
            .register('web.auth', new KoaBrowserAuth(this));

        return this;
    };
}

module.exports = Container;
