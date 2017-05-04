
'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */


import log4js from 'koa-log4';
import Sequelize from 'sequelize';


import {
    log4js as loggerConfig,
    databases
} from '../resources/config';

import RoleClass from './models/Role';
import UserClass from './models/User';
import OAuthClientClass from './models/OAuthClient';
import OAuthCodeClass from './models/OAuthCode';
import OAuthAccessTokenClass from './models/OAuthAccessToken';
import OAuthRefreshTokenClass from './models/OAuthRefreshToken';

log4js.configure(loggerConfig, {cwd: loggerConfig.cwd});

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


const defaultOptions = {logger: dbLogger};

const Role = new RoleClass(common, defaultOptions);

UserClass.addBelongTo(Role.delegate, 'role', 'role_id');
const User = new UserClass(common, defaultOptions);

OAuthClientClass.addBelongTo(User.delegate, 'user', 'user_id');
const OAuthClient = new OAuthClientClass(common, defaultOptions);

OAuthCodeClass.addBelongTo(User.delegate, 'user', 'user_id');
OAuthCodeClass.addBelongTo(OAuthClient.delegate, 'client', 'client_id');
const OAuthCode = new OAuthCodeClass(common, defaultOptions);

OAuthAccessTokenClass.addBelongTo(User.delegate, 'user', 'user_id');
OAuthAccessTokenClass.addBelongTo(OAuthClient.delegate, 'client', 'client_id');
const OAuthAccessToken = new OAuthAccessTokenClass(common, defaultOptions);
OAuthRefreshTokenClass.addBelongTo(OAuthAccessToken.delegate, 'accessToken', 'access_token_id');

module.exports = {
    models: {
        Role: Role,
        User: User,
        OAuthClient: OAuthClient,
        OAuthCode: OAuthCode,
        OAuthAccessToken: OAuthAccessToken,
        OAuthRefreshToken: new OAuthRefreshTokenClass(common, defaultOptions)
    }
};