#! /usr/bin/env bash

echo start building...
rm -rf ./target
mkdir target
cp -r ./src/* ./target/
rm -rf ./target/js/*
webpack > /dev/null
cat ./src/index.html \
	| sed s/%GOOGLE_MAPS_API_KEY%/$GOOGLE_MAPS_API_KEY/g \
	| sed s/%GA_TRACKING_ID%/$GA_TRACKING_ID/g \
	| sed s@%APP_URL%@$APP_URL@g \
	> ./target/index.html
echo done.

echo uploading static files...
aws s3 sync --profile=walk30m --quiet ./target s3://$S3_PUBLIC_BUCKET_NAME
echo done.

