---
layout: post
title: Dockerfileチートシート
---

# Dockerfileチートシート

## Dockerfileとは？

Makefileのようなもの。コンテナの構成を記述する。

http://www.atmarkit.co.jp/ait/articles/1407/08/news031.html


## コマンド


|命令|用途|
|---|---|
|FROM|元となるDockerイメージの指定|
|MAINTAINER|作成者の情報|
|RUN|コマンドの実行|
|ADD|ファイル／ディレクトリの追加|
|CMD|コンテナーの実行コマンド 1|
|ENTRYPOINT|コンテナーの実行コマンド 2|
|WORKDIR|作業ディレクトリの指定|
|ENV|環境変数の指定|
|USER|実行ユーザーの指定|
|EXPOSE|ポートのエクスポート|
|VOLUME|ボリュームのマウント|

### FROM
Dockerfile の一番最初に書いてベースにするイメージ
```Dockerfile
FROM ubuntu:14.04
```
のように書く。イメージ:タグ で、タグは省略できる。
## MAINTAINER
お名前とメールアドレスを書くのがお作法っぽい。多分自由。
```Dockerfile
-MAINTAINER SHIGURE Sayo <sayo@example.com>
+MAINTAINER Sayo SHIGURE <sayo@example.com>
```
### ADD
ADD はローカルまたは URL からコンテナにファイルやディレクトリをコピーする機能
```
ADD spam.txt src/egg.txt
```
#### HTTP 経由
```
ADD http://example.com/spam.txt src/egg.txt
```
http からも直接落とせる。ローカルホストだけでは無い。
#### 自動解凍
ローカルからファイルをコピーした際そのファイルが gzip、 bzip2、 xz の場合は自動で解凍して移動してくれる。
ただし HTTP 経由は解凍してくれない。
以外にはまりどころなので要注意。
#### COPY との違い
COPY は純粋にローカルからホストにコピーする。解凍もしない。HTTP 経由もできない。
#### ワイルドカードとマッチング
```
ADD spam* /egg/
ADD spam?.txt /egg/
```
* や ? などが使える。この仕様は golang の filepath の Match に依存している。
http://golang.org/pkg/path/filepath/#Match
### WORKDIR
カレントディレクトリを移動して固定する。
```
WORKDIR /tmp
```
docker run で起動したときはこのパスがカレントディレクトリになる
## ONBUILD
この Dockerfile を使って作成したイメージを使ってビルドするときに実行されるようにする。
```
ONBUILD RUN git clone ...
```
このイメージをベースに新しくイメージをビルドしたときに git clone でレポジトリが追加される。
**あんまり賢い使い方では無い気がした ...**
#### 参考
- [DockerfileのONBUILD | SOTA](http://deeeet.com/writing/2014/03/21/docker-onbuild/)
## Docker コンテナから GitHub プライベートリポジトリへのアクセスする方法
docker コンテナから GitHub プライベートリポジトリにアクセスするキレイな方法がわからなかった。結局、自動化用の GitHub のアカウントを専用にとってその鍵を使う事にした。自動化を考えるとパスフレーズなしの秘密鍵を使わざるを得ないのが現状。ssh-agent 使う案も一応考えたが挫折。
綺麗な方法があれば教えて欲しい。
最初はソースを git archive でとか考えたが依存関係があったりして面倒くさかった。
- ssh フォルダの中に秘密鍵が入っている
	- ssh/rsa_id
- sources.list がある
#### sources.list
```
deb http://jp.archive.ubuntu.com/ubuntu trusty main restricted
deb-src http://jp.archive.ubuntu.com/ubuntu trusty main restricted
deb http://jp.archive.ubuntu.com/ubuntu trusty-updates main restricted
deb-src http://jp.archive.ubuntu.com/ubuntu trusty-updates main restricted
```
#### Dockerfile
```Dockerfile
FROM ubuntu
ADD sources.list /etc/apt/sources.list
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install git -y
RUN apt-get clean && rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/*
ADD ssh/ /root/.ssh/
RUN chmod 600 /root/.ssh/*
RUN ssh-keyscan -t rsa github.com > ~/.ssh/known_hosts
RUN echo "Host github.com\n\tStrictHostKeyChecking no\n" >> /root/.ssh/config
WORKDIR /root/
RUN git clone git@github.com:<Username>/<Repository>.git
```
とりあえずこれで動いた。
未だにコンテナの中に鍵を入れるの気持ち悪いので何かいい方法が無いか考えてみてる。
#### 参考
- [Dockerfile チートシート
](http://qiita.com/voluntas/items/6a22075423a93d2c7b96)
