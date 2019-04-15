# Photo Uploader

## 簡介
使用 NodeJS 及 koa2 框架開發，可以做到圖片上傳、圖片回傳的服務，為了打造清新優質的環境，在圖片上傳的地方加入了色情圖片偵測的功能，另外在圖片回傳的部分，可以透過參數設定得到不同效果的圖片。

## 使用方式
```
npm install
```
```
npm run start
```

## 圖片上傳
使用 `multipart` 上傳圖片
#### Upload url:
```
/uploadPhoto
```


## 圖片回傳
#### Download url:
```
/getPhoto/YOU_PHOTO_FILENAME
```

####  Query Parameters:
* `width` & `height`: 圖片大小
* `grey`: 黑白效果
* `negate`: 負片效果(與 grey 最多擇一使用)
* `rotate`: 旋轉角度
* `blur`: 模糊效果
* `sharpen`: 銳化效果(與 blur 最多擇一使用)
* `normalize`: 正規化
* `mirror`: 沿 x 或 y 軸作對稱效果

#### Example:
```
/getPhoto/YOUR_PHOTO_FILENAME?width=100&height=100&grey=true&rotate=90&blur=2&normalize=true&mirror=x
```

## 色情圖片偵測
* 原先使用 nude 作為偵測 package ，效果不佳所以並未採用
* 使用 DeepAI 的 Nudity Detection API 做偵測
* 先對縮小上傳圖片做前處理，先調整大小再做偵測，加快速度
* 預設偵測結果 nsfw_score >= 0.9 時判定為色情圖片
* 使用前須要先設定 api key 才能使用 DeepAI API