'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */

import Sequelize from 'sequelize';


import ModelClass from './ModelClass';

export default class OAuthCode extends ModelClass {

    static belongsToDefines = [];

    static addBelongTo = (type, as, foreignKey) => {
        OAuthCode.belongsToDefines.push({type: type, as:as, foreignKey:foreignKey})
    };

    get name() {
        return 'oauth_code';
    }

    get belongsToDefine() {
        return OAuthCode.belongsToDefines;
    };

    get defaultOptions() {
        return {
            schema: 'public',

            tableName: 'oauth_code',

            timestamps: true,

            createdAt: 'timestamp',

            updatedAt: false,

            paranoid: false,

            underscored: true
        };
    }

    get fieldsDefine() {
        return {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: false,
                defaultValue: Sequelize.DEFAULT,
                field: 'id'
            },
            scopes: {
                type: Sequelize.STRING,
                field: 'scopes',
                default: '*'
            },
            revoked: {
                type: Sequelize.BOOLEAN,
                field: 'revoked',
                default: false
            },
            expiresAt: {
                type: Sequelize.DATE,
                field: 'expires_at'
            }
        }
    };

    constructor(provider, options) {
        super(provider, options);
    }
};