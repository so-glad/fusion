'use strict';

/**
 * @author palmtale
 * @since 2017/5/16.
 */


import Sequelize from 'sequelize';

import ModelClass from './ModelClass';
 
export default class OAuthProviderUser extends ModelClass {

    static belongsToDefines = [];

    static addBelongTo = (type, as, foreignKey) => {
        OAuthProviderUser.belongsToDefines.push({type: type, as: as, foreignKey: foreignKey})
    };

    get name() {
        return 'oauth_provider';
    }

    get belongsToDefine() {
        return OAuthProviderUser.belongsToDefines;
    }

    get defaultOptions() {
        return {
            schema: 'public',

            tableName: 'oauth_provider_user',

            timestamps: true,

            paranoid: false,

            underscored: true
        };
    }

    get fieldsDefine() {
        return {
            clientUserKey: {
                type: Sequelize.STRING,
                field: 'client_user_key',
                primaryKey: true
            },
            holderUserKey: {
                type: Sequelize.STRING,
                field: 'holder_user_key',
                primaryKey: true
            },
            providerUserKey: {
                type: Sequelize.STRING,
                field: 'provider_user_key'
            },
            revoked: {
                type: Sequelize.BOOLEAN,
                field: 'revoked',
                defaultValue: false
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
            },
            scope: {
                type: Sequelize.STRING,
                field: 'scope'
            }
        };
    }

    constructor(provider, options) {
        super(provider, options);
    }
}