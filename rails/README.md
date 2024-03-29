# 環境構築
## Railsアプリケーション作成
Railsアプリケーション作成に使うDocker関連のファイルを格納する`app`ディレクトリを作成する。
```sh
cd hello_app
mkdir app && cd app
```

`app`ディレクトリに、以下のファイルを作成する。

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
docker compose up
```

`app`ディレクトリの一階層上に移動して、Dockerコンテナ内からRailsアプリケーションをコピーする。
```sh
cd ..
docker cp <コンテナID>:/rails .
```

Docker関連のファイルを削除する。
```sh
rm -rf app
```

`rails`ディレクトリの名前をアプリケーションの名前に変更する。
```sh
mv rails hello_app
```

## Docker Compose
アプリケーションのディレクトリに、以下のファイルを作成する。サービス名は使用目的に応じて`api`などに変更する。
最初はrootユーザーでデータベースに接続してよいが、セキュリティを考慮して、Dockerコンテナ起動後に専用のDBユーザーを作成して使用した方がよい。
`docker-compose.yml`
```yml
version: "3"
services:
  web:
    build: .
    environment:
      TZ: "Asia/Tokyo"
      BINDING: "0.0.0.0"
    ports:
      - 3000:3000
    depends_on:
      - db
    tty: true
    stdin_open: true
  db:
    image: mysql:8
    environment:
      TZ: "Asia/Tokyo"
      MYSQL_ROOT_PASSWORD: "<rootユーザーのDBパスワード>"
    volumes:
      - mysql_data:/var/lib/mysql:cached
    ports:
      - 3306:3306
volumes:
  mysql_data:
```

`docker-compose.development.yml`
```yml
services:
  web:
    environment:
      RAILS_ENV: "development"
      DATABASE_URL: "mysql2://<DBユーザー名>:<DBパスワード>@db/<DB名>"
```

`docker-compose.production.yml`
```yml
services:
  web:
    environment:
      RAILS_ENV: "production"
      BUNDLE_DEPLOYMENT: 1
      BUNDLE_WITHOUT: "development"
      SECRET_KEY_BASE: "<bundle exec rake secretで生成した文字列>"
      DATABASE_URL: "mysql2://<DBユーザー名>:<DBパスワード>@db/<DB名>"
      RAILS_MASTER_KEY: "<config/master.keyの内容>"
```

アプリケーションのディレクトリにある`Dockerfile`のファイル名を変更する。
```sh
cp -p Dockerfile Dockerfile-production
```

もとの`Dockerfile`をベースにして開発環境用の`Dockerfile`を作成する。

```Dockerfile
FROM ruby:3.3.0-slim as base

EXPOSE 3000

ENV BUNDLE_PATH="/usr/local/bundle"

WORKDIR /rails

FROM base as build

# Install packages needed to build gems
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential default-libmysqlclient-dev git libvips pkg-config

# Install application gems
COPY Gemfile Gemfile.lock ./
RUN gem install bundler && \
    bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl default-mysql-client libvips && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built artifacts: gems
COPY --from=build /usr/local/bundle /usr/local/bundle

# Run and own only the runtime files as a non-root user for security
RUN useradd rails --create-home --shell /bin/bash && \
    chown -R rails:rails /rails

USER rails:rails
```

## Visual Studio Codeの推奨拡張機能
アプリケーションのディレクトリに、`.vscode`ディレクトリを作成して、以下のファイルを作成する。

`extensions.json`
```json
{
  "recommendations": [
    "ms-vscode-remote.vscode-remote-extensionpack",
  ]
}
```

## Dev Containers
アプリケーションのディレクトリに、`.devcontainer`ディレクトリを作成して、以下のファイルを作成する。  
`devcontainer.json`のテンプレートは、Visual Studio Codeのコマンドパレットから取得できる。  
`devcontainer.json`
```json
{
	"name": "Existing Docker Compose (Extend)",
	"dockerComposeFile": [
		"../docker-compose.yml",
                "../docker-compose.development.yml",
		"docker-compose.yml"
	],
	"service": "web",
	"workspaceFolder": "/rails",
	"customizations": {
		"vscode": {
			"extensions": [
				"shopify.ruby",
				"castwide.solargraph",
				"misogi.ruby-rubocop",
				"koichisasada.vscode-rdbg"
			],
			"settings": {
				"[ruby]": {
					"editor.tabSize": 2
			},
				"solargraph.useBundler": "true"
			}
		}
	}
}
```

`docker-compose.yml`を設置しないと、Dev Containersで開いた時にPumaが起動してしまう。  
`docker-compose.yml`
```yml
version: "3"
services:
  web:
    command: /bin/bash -c "while sleep 1000; do :; done"
```

アプリケーションのディレクトリにある`Gemfile`の`development`グループに、以下のGemを追加する。
```gemfile
  gem 'solargraph'
  gem 'rubocop', require: false
  gem 'rubocop-rails', require: false
  gem 'rubocop-performance', require: false
```

## MySQLのデータディレクトリ
アプリケーションのディレクトリに、空ディレクトリを作成する。
```sh
mkdir mysql_data
```

## Dockerコンテナに送信しないファイル
アプリケーションのディレクトリにある`.dockerignore`に、以下の内容を追加する。
```ignore
# Ignore assets. (after rails new).
/.dockerignore
/Dockerfile
/docker-compose*.yml
/mysql_data/
/.vscode/
/.devcontainer/
```

## Gitにチェックインしないファイル
アプリケーションのディレクトリにある`.gitignore`に、以下の内容を追加する。
```ignore
# Ignore assets. (after rails new).
/mysql_data/
```

## Dockerコンテナ起動
Dev Containersで開いた後、初回のみENTRYPOINTのシェルスクリプトでPumaを起動する。
```sh
cd /rails

./bin/docker-entrypoint ./bin/rails server
```

2回目以降は、`rails`コマンドでPumaを起動する。
```sh
cd /rails

./bin/rails s
```
