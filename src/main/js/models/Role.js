
'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */

import Sequelize from 'sequelize';


import ModelClass from './ModelClass';

export default class RoleClass extends ModelClass {

    get name() {return 'role'};

    get fieldsDefine() {
        return {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: false,
                defaultValue: Sequelize.DEFAULT,
                field: 'id'
            },
            name: {
                type: Sequelize.STRING,
                field: 'name'
            },
            code: {
                type: Sequelize.STRING,
                field: 'code'
            },
            revoked: {
                type: Sequelize.BOOLEAN,
                field: 'revoked',
                default: false
            },
            comment: {
                type: Sequelize.STRING,
                field: 'comment'
            }
        };
    }

    get defaultOptions() {
        return {
            schema: 'public',

            tableName: 'role',

            timestamps: true,

            paranoid: false,

            underscored: true
        };
    }

    constructor(provider, options) {
        super(provider, options);
    }
}

