
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
import log4js from 'koa-log4';

import RedisStore from '../../../main/js/stores/Redis';
import Container from '../../../main/js/Container';
import config from '../../resources/config';

const container = new Container(config);
const logger = log4js.getLogger('fusion');

const app = new Koa();
const router = new Router();
app.keys = ['fusion'];
app.use(bodyParser());
app.use(session({
    store: new RedisStore({
        db:2
    }),
    key: 'fusion',
    maxAge: 86400000,
    overwrite: true,
    httpOnly: true,
    signed: true,
}, app));

router.post('/oauth/token', container.getModule('auth').login);
router.post('/oauth/logout', container.getModule('auth').logout);
app.use(router.routes())
    .use(router.allowedMethods());

app.listen(5000);
logger.info('Server launched, listening on port of 5000');