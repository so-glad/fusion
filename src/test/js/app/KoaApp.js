
'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */
 
 
import Koa from 'koa';
import Router from 'koa-router';

import OAuth from '../../../main/js/services/OAuth';
import OAuthServer from '../../../main/js/server/Koa';


const app = new Koa();
const router = new Router();
const oauthServer = new OAuthServer({
    debug: true,
    model: OAuth
});

router.get('/oauth/auth', oauthServer.authorize);
router.post('/oauth/token', oauthServer.token);

app.use(router.routes())
    .use(router.allowedMethods());

app.listen(5000);