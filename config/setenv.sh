#!/usr/bin/env bash

NODE_ENV=production

# 程序日志目录
export LOG_PATH=/ssd/logs

# 程序运行期数据目录
export RUNTIME_PATH=/ssd/runtime

# license目录
export LICENSE_PATH=/ssd/license

# 数据库数据目录
export DB_DATA=/ssd/data

# 程序配置目录
export NODE_CONFIG_DIR=/ssd/mynode/config/config

# 本机非loopback地址
export PRIVATE_IP=192.168.0.100

# neo4j
export NEO4J_HOST=$PRIVATE_IP
export NEO4J_USER=neo4j
export NEO4J_PASSWD=admin

# redis
export REDIS_HOST=$PRIVATE_IP

# elasticsearch
export ES_HOST=$PRIVATE_IP

# postgresql
export PG_HOST=$PRIVATE_IP
export PG_USER=postgres
export PG_PASSWD=postgres
export PG_DB_KB=kb
export PG_DB_NOTIFICATION=notification
export PG_ZHPARSER=chinese
