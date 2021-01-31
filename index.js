const Koa = require('koa');
const Router = require('@koa/router');
const multer = require('@koa/multer');
const routes = require('./routes');

const PORT = 3000;
const HOST = '0.0.0.0';

const app = new Koa();
const router = new Router();
const upload = multer();

router
    .get('/formats', routes.listFormats.bind(routes))
    .post('/convert/:format', upload.single('file'), routes.convertDoc.bind(routes));

app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(PORT, HOST);