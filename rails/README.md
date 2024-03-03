# Railsアプリケーションの作成

appディレクトリ(ディレクトリ名は任意)に、以下のファイルを作成する。

`Gemfile`
```Gemfile.lock
source 'https://rubygems.org'
gem 'rails', '<バージョン>'
```

`Dockerfile`
```Dockerfile
FROM ruby:<バージョン>

ENV LANG="en_US.UTF-8"
ENV TZ="Asia/Tokyo"

WORKDIR /rails

COPY Gemfile .

RUN set -o pipefail -x && \
    gem install bundler && \
    bundle install && \
    : 使用目的に応じてオプションを変更 \
    rails new . -d mysql
```

`docker-compose.yml`
```yml
version: "3"
services:
  app:
    build: .
    tty: true
```

`app`ディレクトリで、Dockerコンテナを起動する。
```sh
cd app
docker compose up
```

`app`ディレクトリの一階層上に移動して、DockerコンテナからRailsアプリケーションをコピーする。
```sh
cd ..
docker cp <コンテナID>:/rails .
```

Dockerコンテナの作成に使用したファイルを削除する。
```sh
rm -rf app
```
