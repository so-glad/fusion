'use strict';

/**
 * @author palmtale
 * @since 2017/5/8.
 */


import Sequelize from 'sequelize';
import ModelClass from './ModelClass';

export default class OAuthProvider extends ModelClass {

    get name() {
        return 'oauth_provider';
    }

    get defaultOptions() {
        return {
            schema: 'public',

            tableName: 'oauth_provider',

            timestamps: true,

            paranoid: false,

            underscored: true
        };
    }

    get fieldsDefine() {
        return {
            type: {
                type: Sequelize.STRING,
                field: 'type',
                primaryKey: true
            },
            clientId: {
                type: Sequelize.STRING,
                field: 'client_id',
                primaryKey: true
            },
            clientSecret: {
                type: Sequelize.STRING,
                field: 'client_secret'
            },
            revoked: {
                type: Sequelize.BOOLEAN,
                field: 'revoked',
                defaultValue: false
            },
            name: {
                type: Sequelize.STRING,
                field: 'name',
                unique: 'oauth_provider_name_type_client_id_unique'
            },
            redirectUrl: {
                type: Sequelize.STRING,
                field: 'redirect_url'
            },
            authorizeUrl: {
                type: Sequelize.STRING,
                field: 'authorize_url'
            },
            tokenUrl: {
                type: Sequelize.STRING,
                field: 'token_url'
            },
            userUrl: {
                type: Sequelize.STRING,
                field: 'user_url'
            }
        };
    }

    constructor(provider, options) {
        super(provider, options);
    }
}