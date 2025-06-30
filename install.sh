#!/bin/bash

cd database

psql -U postgres -f master.sql

cd ../back

pip install -r requirements.txt --break-system-packages

cd ../garciaTec

npm install

