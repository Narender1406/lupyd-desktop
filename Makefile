.PHONY: build clean deps

SRC_FILES := $(shell find src -type f 2>/dev/null || true)
PUBLIC_FILES := $(shell find public -type f 2>/dev/null || true)
CONFIG_FILES := package.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts postcss.config.js .env

node_modules: package.json
	yarn install

dist/index.html: node_modules $(SRC_FILES) $(PUBLIC_FILES) $(CONFIG_FILES)
	yarn build --mode development

build: dist/index.html

deps: node_modules

clean:
	rm -rf dist