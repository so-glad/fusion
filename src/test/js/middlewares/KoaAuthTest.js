'use strict';

/**
 * @author palmtale
 * @since 2017/5/5.
 */


import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import session from 'koa-session';
//import CSRF from 'koa-csrf';
import log4js from 'log4js';

import Container from '../../../main/js/Container';
import config from '../../resources/config';

const container = new Container(config);
const logger = log4js.getLogger('fusion');

const app = new Koa();
const router = new Router();
app.keys = ['fusion'];
app.use(bodyParser());
app.use(container.input.agent.each);
app.use(session(container.config.session, app));

router.get('/session/test', async (ctx) => {
    ctx.session.test = ctx.session.test ? ctx.session.test + 1 : 1;
    console.info(ctx.session.test);
});
router.post('/oauth/token', container.getModule('web.auth').login);
router.post('/oauth/logout', container.getModule('web.auth').logout);

app.use(router.routes())
    .use(router.allowedMethods());

logger.info('Server launched, listening on port of 5000');
app.listen(5000);
