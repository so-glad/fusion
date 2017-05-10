'use strict';

/**
 * @author palmtale
 * @since 2017/5/10.
 */


import Sequelize from 'sequelize';


import ModelClass from './ModelClass';

export default class UserAgentClass extends ModelClass {

    get name() {
        return 'user_agent'
    };

    get defaultOptions() {
        return {
            schema: 'public',

            tableName: 'user_agent',

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
            alias: {
                type: Sequelize.STRING,
                field: 'alias'
            },
            content: {
                type: Sequelize.STRING,
                field: 'content'
            }
        }
    }

    constructor(provider, options) {
        super(provider, options)
    }
};