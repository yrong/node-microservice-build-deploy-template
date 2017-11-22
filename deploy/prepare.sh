#!/usr/bin/env bash

dbs=("elasticsearch" "redis" "neo4j" "pg-$PG_DB_KB" "pg-$PG_DB_NOTIFICATION")

for db in ${dbs[@]}
do
    mkdir -p $DB_DATA/$db
    sudo chmod -R 0777 $DB_DATA/$db
done