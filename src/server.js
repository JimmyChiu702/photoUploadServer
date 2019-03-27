const koa = require('koa');
const router = require('koa-router');
const koaBody = require('koa-body');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const app = new koa();
const photoRouter = new router();

photoRouter.post('/uploadPhoto', async (ctx, next) => {
    try {
        await new Promise((resolve, reject) => {
            fs.rename(ctx.request.files.photo.path, path.resolve(__dirname, `./photos/${ctx.request.files.photo.name}`), err => {
                if (err) reject(err);
                resolve();
            });
        });
    } catch(err) {
        ctx.throw(500, err.message);
        console.error(err);
    }
});

photoRouter.get('/getPhoto/:filename', async (ctx, next) => {
    try {
        const filename = ctx.params.filename;
        const photoPath = path.resolve(__dirname, `./photos/${filename}`);
        const readStream = fs.createReadStream(photoPath);

        let transform = sharp();
        if (ctx.query.width && ctx.query.height) {
            transform.resize(parseInt(ctx.query.width), parseInt(ctx.query.height));
        }
        
        ctx.response.type = `image/${filename.split('.').pop()}`;
        ctx.response.body = readStream.pipe(transform);
    } catch(err) {
        ctx.throw(500, err.message);
        console.error(err);
    }
});

app
.use(koaBody({multipart: true}))
.use(photoRouter.routes());

const port = 80;
app.listen(port, () => {
    console.log(`Server is on and is running on port ${port}`);
});