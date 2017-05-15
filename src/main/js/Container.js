'use strict';

/**
 * @author palmtale
 * @since 2017/5/7.
 */


import log4js from 'koa-log4';
import Sequelize from 'sequelize';

//Models classes
import RoleClass from './models/Role';
import UserClass from './models/User';
import OAuthClientClass from './models/OAuthClient';
import OAuthCodeClass from './models/OAuthCode';
import OAuthAccessTokenClass from './models/OAuthAccessToken';
import OAuthRefreshTokenClass from './models/OAuthRefreshToken';
import OAuthProviderClass from './models/OAuthProvider';
import OAuthProviderUser from './models/OAuthProviderUser';
import UserAgentClass from './models/UserAgent';
//Services
import OAuthServerService from './services/OAuthServer';
import OAuthProviderService from './services/OAuthProvider';
//Server Middleware
import KoaOAuthServer from './middlewares/KoaOAuthServer';
import KoaOAuthClient from './middlewares/KoaOAuthClient';
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

    OAuthAccessTokenClass.addBelongTo(User.delegate, 'user', 'user_id');
    OAuthAccessTokenClass.addBelongTo(OAuthClient.delegate, 'client', 'client_id');
    const OAuthAccessToken = new OAuthAccessTokenClass(databases.common, {});
    OAuthRefreshTokenClass.addBelongTo(OAuthAccessToken.delegate, 'accessToken', 'access_token_id');
    const OAuthRefreshToken = new OAuthRefreshTokenClass(databases.common, {});

    const OAuthProvider = new OAuthProviderClass(databases.common, {});
    OAuthProviderUser.addBelongTo(User.delegate, 'user', 'user_id');
    return {
        Role: Role,
        User: User,
        OAuthClient: OAuthClient,
        OAuthCode: OAuthCode,
        OAuthAccessToken: OAuthAccessToken,
        OAuthRefreshToken: OAuthRefreshToken,
        OAuthProvider: OAuthProvider,
        UserAgent: UserAgent
    };
};

export default class Container extends Context {

    callbacks = [];

    constructor(config) {
        super(config);
        log4js.configure(this.config.log4js, {cwd: this.config.log4js.cwd});
        const defaultLogging = this.config.log4js.appenders[0].category;
        const databases = configDatabase(this.config.databases);
        const models = configModels(databases);

        this.register('models', models)
            .register('service.auth.server', new OAuthServerService({models: models, logger: defaultLogging}))
            .register('service.auth.client', new OAuthProviderService({models: models, logger: defaultLogging}))
            .register('input.agent', new KoaUserAgent(models, defaultLogging));
    }

    heatUp = async () => {
        const defaultLogging = this.config.log4js.appenders[0].category;
        const models = this.module('models');
        const config = this.config;
        const client = await models.OAuthClient.findOne({where: {id: config.client.web}});
        this.register('oauth.client.web', client);
        const providers = await models.OAuthProvider.findAll({where:
            {type: Object.keys(config.client), clientId: Object.values(config.client)}});
        this.register('api.auth.client', new KoaOAuthClient({
            service: this.module('service.auth.client'),
            logger: defaultLogging,
            providers: providers
        }))
        .register('api.auth.server', new KoaOAuthServer({
            debug: false,
            service: this.module('service.auth.server'),
            logger: defaultLogging
        }))
        .register('web.auth', new KoaBrowserAuth(this));
        return this;
    };
}

module.exports = Container;
