'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */


import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import session from 'koa-session';
import Router from 'koa-router';

import RedisStore from '../../../main/js/stores/Redis';


const app = new Koa();
const router = new Router();
const oauthServer =

    router.get('/oauth/auth', oauthServer.authorize);
router.post('/oauth/token', async () => {

});

app.keys = ['fusion', 'remember'];
app.use(bodyParser());
app.use(session({
    store: new RedisStore({
        db: 2
    }),
    key: 'fusion', /** (string) cookie key (default is koa:sess) */
    maxAge: 86400000, /** (number) maxAge in ms (default is 1 days) */
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
}, app));
app.use(router.routes())
    .use(router.allowedMethods());

app.listen(5000);