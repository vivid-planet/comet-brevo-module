#!/usr/bin/env bash
set -e

. ~/.nvm/nvm.sh

# jump into project dir
cd $(dirname $0)


if [[ ! -f .env.local ]]
then
    echo -e '# override for local env' > .env.local
fi


# use correct npm and install dependencies
nvm install
nvm use
npm i -g pnpm@8
pnpm install

# create admin symlinks
ln -sf ../api/schema.gql ./packages/admin/schema.gql

# create admin symlinks
ln -sf ../api/block-meta.json ./packages/mail-rendering/block-meta.json

# create demo api symlinks
ln -sf ../../.env ./demo/api/.env
ln -sf ../../.env.local ./demo/api

# create demo admin symlinks
ln -sf ../../.env ./demo/admin/.env
ln -sf ../api/schema.gql ./demo/admin/
ln -sf ../api/block-meta.json ./demo/admin/
ln -sf ../api/src/comet-config.json ./demo/admin/

# create demo site symlinks
ln -sf ../../.env ./demo/site/.env
ln -sf ../api/schema.gql ./demo/site/
ln -sf ../api/block-meta.json ./demo/site/
ln -sf ../api/src/comet-config.json ./demo/site/

# create demo campaign symlinks
ln -sf ../../.env ./demo/campaign/.env
ln -sf ../../.env.local ./demo/campaign/.env.local
ln -sf ../api/schema.gql ./demo/campaign/
ln -sf ../api/block-meta.json ./demo/campaign/
ln -sf ../api/src/comet-config.json ./demo/campaign/

# Lang install
sh ./demo/admin/intl-update.sh
sh ./demo/site/intl-update.sh
sh ./demo/campaign/intl-update.sh

mkdir -p ./demo/api/uploads

