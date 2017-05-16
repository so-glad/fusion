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
        OAuthProviderUser.belongsToDefines.push({type: type, as: as, foreignKey: foreignKey});
    };

    get name() {
        return 'oauth_provider_user';
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
            providerUserKey: {
                type: Sequelize.STRING,
                field: 'provider_user_key',
                primaryKey: true
            },
            username: {
                type: Sequelize.STRING,
                field: 'username'
            },
            revoked: {
                type: Sequelize.BOOLEAN,
                field: 'revoked',
                defaultValue: false
            },
            clientUserKeys: {
                type: Sequelize.JSON,
                field: 'client_user_keys',
            },
            payload: {
                type: Sequelize.JSON,
                field: 'payload'
            }
        };
    }

    constructor(provider, options) {
        super(provider, options);
    }
}