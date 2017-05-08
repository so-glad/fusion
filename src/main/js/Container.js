
'use strict';

/**
 * @author palmtale
 * @since 2017/5/7.
 */


import log4js from 'koa-log4';
import Sequelize from 'sequelize';
import oauth from 'oauth';

import RoleClass from './models/Role';
import UserClass from './models/User';
import OAuthClientClass from './models/OAuthClient';
import OAuthCodeClass from './models/OAuthCode';
import OAuthAccessTokenClass from './models/OAuthAccessToken';
import OAuthRefreshTokenClass from './models/OAuthRefreshToken';
import OAuthProviderClass from './models/OAuthProvider';

import OAuth from './services/OAuthServer';

import OAuthServer from './middlewares/KoaOAuthServer';
import KoaAuth from './middlewares/KoaAuthBrowser';

import Context from './Context';

const configDatabase = (databases) => {
    const dbLogger = log4js.getLogger('fusion-db');
    const common = new Sequelize(databases.common.name,
        databases.common.username, databases.common.password, {
            dialect: databases.common.dialect,
            host: databases.common.host,
            port: databases.common.port,
            pool: {
                max: 8,
                min: 3,
                idle: 10000
            },
            logging: msg => dbLogger.info.apply(dbLogger, [msg])
        });
    return {common: common};
};

const configModels = (databases) => {
    const defaultOptions = {logger: log4js.getLogger('fusion-db')};

    const Role = new RoleClass(databases.common, defaultOptions);

    UserClass.addBelongTo(Role.delegate, 'role', 'role_id');
    const User = new UserClass(databases.common, defaultOptions);

    OAuthClientClass.addBelongTo(User.delegate, 'user', 'user_id');
    const OAuthClient = new OAuthClientClass(databases.common, defaultOptions);

    OAuthCodeClass.addBelongTo(User.delegate, 'user', 'user_id');
    OAuthCodeClass.addBelongTo(OAuthClient.delegate, 'client', 'client_id');
    const OAuthCode = new OAuthCodeClass(databases.common, defaultOptions);

    OAuthAccessTokenClass.addBelongTo(User.delegate, 'user', 'user_id');
    OAuthAccessTokenClass.addBelongTo(OAuthClient.delegate, 'client', 'client_id');
    const OAuthAccessToken = new OAuthAccessTokenClass(databases.common, defaultOptions);
    OAuthRefreshTokenClass.addBelongTo(OAuthAccessToken.delegate, 'accessToken', 'access_token_id');
    const OAuthRefreshToken = new OAuthRefreshTokenClass(databases.common, defaultOptions);

    const OAuthProvider = new OAuthProviderClass(databases.common, defaultOptions);
    return {
        Role: Role,
        User: User,
        OAuthClient: OAuthClient,
        OAuthCode: OAuthCode,
        OAuthAccessToken: OAuthAccessToken,
        OAuthRefreshToken: OAuthRefreshToken,
        OAuthProvider: OAuthProvider
    };
};

export default class Container extends Context {
    constructor(config){
        super(config);
        log4js.configure(this.config.log4js, {cwd: this.config.log4js.cwd});
        const databases = configDatabase(this.config.databases);
        const models = configModels(databases);
        const oauthServer = new OAuthServer({
            debug: false,
            model: new OAuth(models)
        });

        this.register('models', models)
            .register('auth', new KoaAuth(oauthServer))
            .register('default.client', this.config.client)
            .register('client.oauth', oauth);
    }
}

module.exports = Container;
