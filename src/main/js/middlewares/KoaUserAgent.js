
'use strict';

/**
 * @author palmtale
 * @since 2017/5/10.
 */

import log4js from 'koa-log4';

export default class KoaUserAgent {

    UserAgent = null;
    logger = console;

    constructor(models, logging) {
        this.UserAgent = models.UserAgent;
        this.logger = logging ? log4js.getLogger(logging) : this.logger;
    }

    each = async(ctx, next) => {
        this.UserAgent.findOrCreate({where: {content: ctx.request.header['user-agent']}, defaults: {}})
            .then(userAgent => this.logger.info(userAgent[0].content))
            .catch(e => this.logger.error(e));
        await next();
    };
};