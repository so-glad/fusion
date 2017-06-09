'use strict';

/**
 * @author palmtale
 * @since 2017/5/7.
 */


import log4js from 'log4js';
import Sequelize from 'sequelize';

//Storage Define
import RedisStore from './stores/Redis';

//Models classes
import {Common} from 'factors';

//Services
import UserService from './services/User';
import OAuthClientService from './services/OAuthClient';
import OAuthTokenService from './services/OAuthToken';
import OAuthCodeService from './services/OAuthCode';
import OAuthProviderService from './services/OAuthProvider';

//Server Middleware
import KoaOAuthServer from './middlewares/KoaOAuthServer';
import KoaBrowserAuth from './middlewares/KoaBrowserAuth';
//Extra
import KoaUserAgent from './middlewares/KoaUserAgent';
import Context from './Context';

const configStorage = (databases) => {
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

const configCommonModels = (commonDefine) => {
    const common = new Common(commonDefine, {});
    const {User, OAuthProvider} = common.models;
    const {OAuthAccessClass, OAuthUserClass} = common;
    OAuthAccessClass.addBelongTo(User.delegate, 'user', 'user_id');
    OAuthAccessClass.addBelongTo(OAuthProvider.delegate, 'provider', 'app_id', 'app_id');
    OAuthUserClass.addBelongTo(User.delegate, 'user', 'user_id');
    common.models.OAuthAccess = (options) =>
        new OAuthAccessClass(commonDefine, Object.assign({schema: 'oauth'}, options));
    common.models.OAuthUser = (options) =>
        new OAuthUserClass(commonDefine, Object.assign({schema: 'oauth'}, options));
    return common.models;
};

const configOAuthProviders = async (clientConfig, providerModel) => {
    let providers = [];
    for (const type in clientConfig) {
        const clients = clientConfig[type];
        const pros = await providerModel.findAll({where: {type: type, appId: Object.values(clients)}});
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

const configSessionStore = (sessionConfig) => {
    const redisBasic = sessionConfig.redis;

    if (sessionConfig.store.indexOf('redis') === 0) {
        const sessionRedis = Object.assign({}, redisBasic);
        if (sessionConfig.store.length >= 7) {
            sessionRedis.db = parseInt(sessionConfig.store.substring(6));
        } else {
            sessionRedis.db = 0;
        }
        return new RedisStore(sessionRedis);
    }
};

export default class Container extends Context {

    constructor(config) {
        super(config);
        log4js.configure(this.config.log4js, {cwd: this.config.log4js.cwd});
        const defaultLogging = this.config.log4js.appenders[0].category;

        const databases = configStorage(this.config.databases);
        const commonModels = configCommonModels(databases.common);

        this.config.session.store =
            configSessionStore(Object.assign({redis: this.config.databases.redis}, this.config.session));

        const providers = configOAuthProviders(config.client, commonModels.OAuthProvider);
        const oauthProviderService = new OAuthProviderService({
            accessModelClass: commonModels.OAuthAccess,
            userModelClass: commonModels.OAuthUser,
            localUserModel: commonModels.User,
            logger: defaultLogging,
            providers: providers
        });

        this.register('storage.relation', databases)
            .register('models.common', commonModels)
            .register('input.agent', new KoaUserAgent(commonModels, defaultLogging))
            .register('service.user', new UserService({UserModel: commonModels.User, logger: defaultLogging}))
            .register('service.oauth.client', new OAuthClientService({OAuthClientModel: commonModels.OAuthClient, logger: defaultLogging}))
            .register('service.oauth.token', new OAuthTokenService({OAuthTokenModel: commonModels.OAuthToken, logger: defaultLogging}))
            .register('service.oauth.code', new OAuthCodeService({OAuthCodeModel: commonModels.OAuthCode, logger: defaultLogging}))
            .register('service.oauth.provider', oauthProviderService);
    }

    heatUp = async () => {
        const defaultLogging = this.config.log4js.appenders[0].category;
        const models = this.models.common;
        const config = this.config;
        const client = await models.OAuthClient.findOne({where: {id: config.client.web}});

        const oauthService = Object.assign({},
            this.service.user,
            this.service.oauth.client,
            this.service.oauth.code,
            this.service.oauth.token,
            this.service.oauth.provider);

        const koaOAuthServer = new KoaOAuthServer({
            debug: false,
            service: oauthService,
            logger: defaultLogging
        });

        this.register('oauth.client.web', client)
            .register('api.auth', koaOAuthServer)
            .register('web.auth', new KoaBrowserAuth(this));

        return this;
    };
}

module.exports = Container;
