
'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */
 

import Sequelize from 'sequelize';
import log4js from 'koa-log4';
import {
    log4js as loggerConfig,
    databases
} from '../resources/config';

log4js.configure(loggerConfig, {cwd: loggerConfig.cwd});

const dbLogger = log4js.getLogger('fusion-db');

module.exports = {
    persistence: {
        common: new Sequelize(databases.common.name,
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
            })
    }
};