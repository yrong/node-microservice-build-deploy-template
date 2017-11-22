#! /bin/bash

yarn install --production=true
cp -rf ./node_modules ./build
git_commit_id=$(git rev-parse HEAD)
git_commit_date=$(git show -s --format=%ci HEAD |tail |awk '{print $1}')
filename="$git_commit_date-$git_commit_id"

if [ "$EDITION" = "docker" ]; then
    docker rm -f $NODE_NAME
    docker rmi $NODE_NAME:$git_commit_id
    docker build -t $NODE_NAME:$git_commit_id .
else
  mkdir -p release
  tar -zcvf release/$NODE_NAME-$git_commit_date-$git_commit_id.tar.gz ./build
fi
