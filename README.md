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
スマホの加速度の情報を参照するには `https://` でのアクセスが必須になります
PCでもデータを投入できるようにしてあります。(後述)
```


# 使い方
## 全体の動き
nuxtで作ったSPAっぽいアプリを読み込み、
SPAからxhrでjson/containerをnuxt/api(=express/node.js)へ送る
そこからkafkaクラスタへ送付する

![](./docs/sequence.png)
図1.シーケンス図
```plantuml
group Init
	Browser -> Nuxt: Request
	Nuxt->Browser: Document
end
group send data [recursive post/post]
	Browser->Browser: Motion
	Browser->NuxtApi: xhr
	NuxtApi->KafkaCluster: kafka
end
```

## kafkaとの接続
`api/index.js` にkafkaへの接続設定（IPアドレスなど）があります。
環境変数の読み込みが簡単には思えなかったのでハードコードです。(要修正)

## 画面と使い方
![](./docs/screenshot.png)

1. 定期的にxhrを送信するときの設定値(2.を有効にしたときに使われる値)
2. チェック時に定期的にデータをxhrで送信する。
3. 送るデータ(json/container/json&container) json&containerはxhrをjsonとcontainerで独立して発行します
4. (ほぼ📱限定) `https://` でアクセスしている際に加速度の情報にJavaScriptからアクセス可能にします
5. 疎通チェック、 `Browser` と `NuxtAPI` 間が疎通していることを確認します
6. 現在の加速度や傾き情報を1回だけ送信します
7. 加速度や傾き情報を乱数を元に適当に更新します。値の更新のみであり次回以降のxhrに使われます。

## 本アプリを利用する期待
リアルタイムの値の変更反映なので 1と2の機能で定期的に値を更新している状態で、7を操作したさいにその変更がみられることがゴールになると思います。