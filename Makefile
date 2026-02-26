.PHONY: install dev build start lint test test-watch clean

# 初期化
install:
	npm install

# 開発サーバー起動
dev:
	npm run dev

# ビルド
build:
	npm run build

# 本番サーバー起動
start:
	npm run start

# Lint
lint:
	npm run lint

# テスト
test:
	npm run test

# テスト（watchモード）
test-watch:
	npm run test:watch

# デプロイ（ビルド後に Vercel へデプロイ）
deploy:
	npx vercel --prod

# node_modules と .next を削除
clean:
	rm -rf node_modules .next
