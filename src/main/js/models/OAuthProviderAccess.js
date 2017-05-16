'use strict';

/**
 * @author palmtale
 * @since 2017/5/16.
 */


import Sequelize from 'sequelize';

import ModelClass from './ModelClass';
 
export default class OAuthProviderAccess extends ModelClass {

    static belongsToDefines = [];

    static addBelongTo = (type, as, foreignKey) => {
        OAuthProviderAccess.belongsToDefines.push({type: type, as: as, foreignKey: foreignKey});
    };

    get name() {
        return 'oauth_provider_access';
    }

    get belongsToDefine() {
        return OAuthProviderAccess.belongsToDefines;
    }

    get defaultOptions() {
        return {
            schema: 'heap',

            tableName: 'oauth_provider_access',

            timestamps: true,

            createdAt: 'timestamp',

            updatedAt: false,

            paranoid: false,

            underscored: true
        };
    }

    get fieldsDefine() {
        return {
            action: {
                type: Sequelize.STRING,
                field: 'action'
            },
            scope: {
                type: Sequelize.STRING,
                field: 'scope'
            },
            state: {
                type: Sequelize.STRING,
                field: 'state'
            },
            accessToken: {
                type: Sequelize.STRING,
                field: 'access_token'
            },
            accessTime: {
                type: Sequelize.INTEGER,
                field: 'access_time'
            },
            refreshToken: {
                type: Sequelize.STRING,
                field: 'refresh_token'
            },
            refreshTime: {
                type: Sequelize.INTEGER,
                field: 'refresh_time'
            }
        };
    }

    constructor(provider, options) {
        super(provider, options);
    }
}