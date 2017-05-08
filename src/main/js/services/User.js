
'use strict';

/**
 * @author palmtale
 * @since 2017/5/8.
 */

import log4js from 'koa-log4';

const logger = log4js.getLogger('fusion');

export default class UserService {

    userModel = null;

    constructor(models) {
        this.userModel = models.User;
    }

    findUserByUsername = async (username) => {
        const User = this.userModel;
        try {
            return await User.findOne({where: {$or: [{username: username}, {email: username}, {mobile: username}]}});
        } catch(e) {
            logger.error(e);
            return false;
        }
    };
}