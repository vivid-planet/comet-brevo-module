#!/usr/bin/env sh

cd "$(dirname "$0")" || exit

rm -rf ./lang/
mkdir -p ./lang

git clone https://github.com/vivid-planet/comet-brevo-module-lang.git lang/comet-brevo-module-demo-lang
