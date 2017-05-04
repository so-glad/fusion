
'use strict';

/**
 * @author palmtale
 * @since 2017/5/3.
 */
 
 
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';

import OAuth from '../../../main/js/services/OAuth';
import OAuthServer from '../../../main/js/entries/Koa';


const app = new Koa();
const router = new Router();
const oauthServer = new OAuthServer({
    debug: true,
    model: new OAuth()
});

router.get('/oauth/auth', oauthServer.authorize());
router.post('/oauth/token', oauthServer.token());

app.use(bodyParser());
app.use(router.routes())
    .use(router.allowedMethods());

app.listen(5000);