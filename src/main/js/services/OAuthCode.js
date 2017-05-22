'use strict';

/**
 * @author palmtale
 * @since 2017/5/22.
 */

import log4js from 'log4js';

export default class OAuthCodeService {

    codeModel = null;

    logger = console;

    constructor(options) {
        this.codeModel = options.OAuthCodeModel;
        this.logger = (typeof options.logger === 'string') ? log4js.getLogger(options.logger) :
            (options.logger || this.logger);
    }

    saveAuthorizationCode = async (code, client, user) => {
        const savedCode = await this.codeModel.create({code: code.authorizationCode, user_id: user.id, client_id: client.id});
        return {code: savedCode};
    };
}
