'use strict';

/**
 * @author palmtale
 * @since 2017/5/8.
 */


import bcrypt from 'bcrypt';
import log4js from 'log4js';


export default class UserService {

    userModel = null;

    logger = console;

    constructor(options) {
        this.userModel = options.UserModel;
        this.logger = (typeof options.logger === 'string') ? log4js.getLogger(options.logger) :
            (options.logger || this.logger);
    }

    getUser = async (username, password) => {
        try {
            const user = await this.userModel.findOne({
                where: {$or: [{username: username}, {email: username}, {mobile: username}]},
                include: [{all: true}]
            });
            if (user && bcrypt.compareSync(password, user.password)) {
                return {
                    id: user.id,
                    username: user.username,
                    alias: user.alias,
                    avatar: user.avatar,
                    email: user.email,
                    mobile: user.mobile,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                };
            }
            this.logger.warn('Get user via username [' + username + '], ' +
                'password [' +password+ '] failed');
            return false;
        } catch (e) {
            this.logger.error(e);
            return false;
        }
    };
}