'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */

import Sequelize from 'sequelize';


import ModelClass from './ModelClass';

export default class OAuthRefreshToken extends ModelClass {

    static belongsToDefines = [];

    static addBelongTo = (type, as, foreignKey) => {
        OAuthRefreshToken.belongsToDefines.push({type: type, as:as, foreignKey:foreignKey})
    };

    get name() {
        return 'oauth_refresh_token';
    }

    get belongsToDefine() {
        return OAuthRefreshToken.belongsToDefines;
    };

    get defaultOptions() {
        return {
            schema: 'public',

            tableName: 'oauth_refresh_token',

            timestamps: true,

            deletedAt: 'expires_at',

            paranoid: true,

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
            revoked: {
                type: Sequelize.BOOLEAN,
                field: 'revoked',
                default: false
            }
        }
    };

    constructor(provider, options) {
        super(provider, options);
    }
};