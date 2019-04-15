const koa = require('koa');
const router = require('koa-router');
const koaBody = require('koa-body');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const nude = require('nude');
const deepai = require('deepai');

const app = new koa();
const photoRouter = new router();

/* set DeepAI api key */
const api_key = '';
deepai.setApiKey(api_key);
const nude_score = 0.9;

photoRouter.post('/uploadPhoto', async (ctx, next) => {
    try {
/*
        await new Promise((resolve, reject) => {
            nude.scan(ctx.request.files.photo.path, res => {
                if (res) {
                    let err = new Error('Nude found in this image');
                    reject(err);
                }
                resolve(res);
            })
        });
*/
        const fileStream = fs.createReadStream(ctx.request.files.photo.path);
        fileStream.pipe(sharp().resize(100, 100, {
            fit: 'fill'
        }));
        let res = await deepai.callStandardApi("nsfw-detector", {
            image: fileStream,
        });
        console.log('nsfw_score: ' + res.output.nsfw_score);
        if (res.output.nsfw_score >= nude_score) {
            throw new Error('This image contains pornography');
        }
        await new Promise((resolve, reject) => {
            fs.rename(ctx.request.files.photo.path, path.resolve(__dirname, `./photos/${ctx.request.files.photo.name}`), err => {
                if (err) reject(err);
                resolve();
            });
        });
        ctx.status = 200;
    } catch(err) {
        ctx.response.status = 400;
        ctx.response.message = err.message;
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
        if (ctx.query.grey === 'true') {
            transform.grayscale();
        } else if (ctx.query.negate === 'true') {
            transform.negate(true);
        }
        if (ctx.query.rotate) {
            transform.rotate(parseInt(ctx.query.rotate));
        }
        if (ctx.query.blur) {
            transform.blur(parseFloat(ctx.query.blur));
        } else if (ctx.query.sharpen) {
            transform.sharpen(parseFloat(ctx.query.sharpen));
        }
        if (ctx.query.normalize === 'true') {
            transform.normalize(true);
        }
        if (ctx.query.mirror) {
            if (ctx.query.mirror === 'x') {
                transform.flop();
            } else if (ctx.query.mirror === 'y') {
                transform.flip();
            }
        }
        
        ctx.response.status = 200;
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