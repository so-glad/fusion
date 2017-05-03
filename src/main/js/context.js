
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
import OAuthClient from './models/OAuthClient';
import OAuthCode from './models/OAuthCode';
import OAuthAccessToken from './models/OAuthAccessToken';
import OAuthRefreshToken from './models/OAuthRefreshToken';

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

module.exports = {
    models: {
        Role: new RoleClass(common, {logger: dbLogger}),
        User: new UserClass(common, {logger: dbLogger}),
        OAuthClient: new OAuthClient(common, {logger: dbLogger}),
        OAuthCode: new OAuthCode(common, {logger: dbLogger}),
        OAuthAccessToken: new OAuthAccessToken(common, {logger: dbLogger}),
        OAuthRefreshToken: new OAuthRefreshToken(common, {logger: dbLogger})
    }
};