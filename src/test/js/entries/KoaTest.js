
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
import OAuth from '../../../main/js/services/OAuth';
import OAuthServer from '../../../main/js/entries/Koa';


const app = new Koa();
const router = new Router();
const oauthServer = new OAuthServer({
    debug: true,
    model: new OAuth()
});

router.get('/oauth/auth', oauthServer.authorize);
router.post('/oauth/token', oauthServer.token);

const countSession = (ctx) => {
    ctx.session.count = ctx.session.count || 0;
    ctx.session.count++;
    return ctx.session.count;
};
router.get('/session/test', async(ctx) => {
    ctx.statusCode = 200;
    ctx.body = countSession(ctx) + ' views';
});

router.get('/session/remove', async (ctx, next) => {
    ctx.session = null;
    ctx.statusCode = 200;
    ctx.body = 'Session removed';
});

router.get('/session/regen', async (ctx, next) => {
    const before = ctx.session.count;
    console.info(before);
    await ctx.regenerateSession();
    const after = countSession(ctx);
    ctx.statusCode = 200;
    ctx.body = before + ':' + after;

});

app.keys = ['fusion'];
app.use(bodyParser());
app.use(session({
    store: new RedisStore({
        db:2
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