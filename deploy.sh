#! /usr/bin/env bash

echo "               _ _    _____  _____                 _            _             "
echo "              | | |  |____ ||  _  |               | |          | |            "
echo "__      ____ _| | | __   / /| |/' |_ __ ___     __| | ___ _ __ | | ___  _   _ "
echo "\ \ /\ / / _\` | | |/ /   \ \|  /| | '_ \` _ \   / _\` |/ _ \ '_ \| |/ _ \| | | |"
echo " \ V  V / (_| | |   <.___/ /\ |_/ / | | | | | | (_| |  __/ |_) | | (_) | |_| |"
echo "  \_/\_/ \__,_|_|_|\_\____/  \___/|_| |_| |_|  \__,_|\___| .__/|_|\___/ \__, |"
echo "                                                         | |             __/ |"
echo "                                                         |_|            |___/ "

echo building frontend assets...
rm -rf ./tmp
mkdir tmp
cp -r ./httpdocs/src/* ./tmp/
cd ./httpdocs
webpack > /dev/null
cd ../
rm -rf ./tmp/resources/js/*
cp -r ./httpdocs/target/resources/js/* ./tmp/resources/js/
cat ./httpdocs/src/index.html \
	| sed s/%GOOGLE_MAPS_API_KEY%/$GOOGLE_MAPS_API_KEY/g \
	| sed s/%GA_TRACKING_ID%/$GA_TRACKING_ID/g \
	> ./tmp/index.html
echo done.

echo uploading static files...
aws s3 sync --profile=walk30m --quiet ./tmp s3://walk30m
rm -rf ./tmp
echo done.

echo deploying lambda functions...
echo 1/3 ipInfo...
cd ./lambda && \
	mkdir target && \
	cp -r ./ipInfo ./target/ && \
	cat ./ipInfo/config.js | sed s/%IP_INFO_DB_KEY%/$IP_INFO_DB_KEY/g > ./target/ipInfo/config.js && \
	cd ./target && \
	zip -q -r deployment.zip ./ipInfo/* && \
	cdir=`pwd` && \
	aws lambda update-function-code --profile=walk30m --function-name=ipInfo --zip-file=fileb://${cdir}/deployment.zip && \
	rm deployment.zip && \
	rm -rf ./target && \
	cd ../../

echo 2/3 createExecutionLog...
	cd ./lambda/executionLog && \
	zip -q -r deployment.zip ./create/* && \
	cdir=`pwd` && \
	aws lambda update-function-code --profile=walk30m --function-name=createExecutionLog --zip-file=fileb://${cdir}/deployment.zip && \
	rm deployment.zip && \
	cd ../../

echo 3/3 updateExecutionLog...
	cd ./lambda/executionLog && \
	zip -q -r deployment.zip ./update/* && \
	cdir=`pwd` && \
	aws lambda update-function-code --profile=walk30m --function-name=updateExecutionLog --zip-file=fileb://${cdir}/deployment.zip && \
	rm deployment.zip && \
	cd ../../
echo done.

