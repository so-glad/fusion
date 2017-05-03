
'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */


import Sequelize from 'sequelize';


import ModelClass from './ModelClass';

export default class UserClass extends ModelClass {

    static belongsToDefines = [];

    static addBelongTo = (type, as, foreignKey) => {
        UserClass.belongsToDefines.push({type: type, as:as, foreignKey:foreignKey})
    };

    get name() {return 'user'};

    get belongsToDefine() {
        return UserClass.belongsToDefines;
    };

    get defaultOptions() {
        return {
            schema: 'public',

            tableName: 'user',

            timestamps: true,

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
            username: {
                type: Sequelize.STRING,
                field: 'username',
                unique: true
            },
            password: {
                type: Sequelize.STRING,
                field: 'password'
            },
            salt: {
                type: Sequelize.STRING,
                field: 'salt'
            },
            revoked: {
                type: Sequelize.BOOLEAN,
                field: 'revoked',
                default: false
            },
            status: {
                type: Sequelize.STRING,
                field: 'status'
            },
            alias: {
                type: Sequelize.STRING,
                field: 'alias'
            },
            avatar: {
                type: Sequelize.STRING,
                field: 'avatar'
            },
            email: {
                type: Sequelize.STRING,
                field: 'email',
                unique: true,
                default: ''
            },
            emailVerified: {
                type: Sequelize.BOOLEAN,
                field: 'email_verified',
                default: false
            },
            mobile: {
                type: Sequelize.STRING,
                field: 'mobile',
                unique: true,
                default: ''
            },
            mobileVerified: {
                type: Sequelize.BOOLEAN,
                field: 'mobile_verified',
                default: false
            },
            rememberToken: {
                type: Sequelize.STRING,
                field: 'remember_token',
                default: ''
            }
        }
    };

    constructor(provider, options) {
        super(provider, options)
    }
};