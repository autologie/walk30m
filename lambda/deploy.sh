#! /usr/bin/env bash

echo 1/4 ipInfo...
rm -rf ./target && \
    mkdir target && \
	cp -r ./ipInfo ./target/ && \
	cat ./ipInfo/config.js | sed s/%IP_INFO_DB_KEY%/$IP_INFO_DB_KEY/g > ./target/ipInfo/config.js && \
	cd ./target && \
	zip -q -r deployment.zip ./ipInfo/* && \
	cdir=`pwd` && \
	aws lambda update-function-code --profile=walk30m --function-name=ipInfo --zip-file=fileb://${cdir}/deployment.zip > /dev/null && \
	rm -rf ./target && \
	cd ../

echo 2/4 createExecutionLog...
cd ./executionLog && \
	zip -q -r deployment.zip ./create/* && \
	cdir=`pwd` && \
	aws lambda update-function-code --profile=walk30m --function-name=createExecutionLog --zip-file=fileb://${cdir}/deployment.zip > /dev/null && \
	cd ../

echo 3/4 updateExecutionLog...
cd ./executionLog && \
	zip -q -r deployment.zip ./update/* && \
	cdir=`pwd` && \
	aws lambda update-function-code --profile=walk30m --function-name=updateExecutionLog --zip-file=fileb://${cdir}/deployment.zip > /dev/null && \
	cd ../

echo 4/4 createMessage...
rm -rf target && \
    mkdir target && \
    cp -r ./messages/create ./target/ && \
	cat ./messages/create/index.js | sed s/%MESSAGE_TOPIC_ARN%/$MESSAGE_TOPIC_ARN/g > ./target/create/index.js && \
    cd ./target && \
	zip -q -r deployment.zip ./create/* && \
	cdir=`pwd` && \
	aws lambda update-function-code --profile=walk30m --function-name=createMessage --zip-file=fileb://${cdir}/deployment.zip > /dev/null && \
	rm -rf ./target && \
	cd ../

