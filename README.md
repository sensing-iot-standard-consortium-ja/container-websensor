# kafka-mobile-sensor
kafka-motion-sensor

```
[Nuxt Vue]
 | XHR(json/container)
[Nuxt Middleware(express)/Node.js/Server]
 | kafka(json/container)
[kafka broker]
```

## prepare

1. ngrok account
開発時向け
go to https://ngrok.com/
create account
get token
echo NGROK_AUTHTOKEN={your token} > .env

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start
インターネットからアクセスするためにはngrok等で対応する
$ ngrok http 3000
加速度の情報を参照するには `https://` でのアクセスが必須になります

```

## kafkaとの接続
`api/index.js` にkafkaへの接続設定（IPアドレスなど）があります。
環境変数の読み込みが簡単には思えなかったのでハードコードです。
