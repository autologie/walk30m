#! /usr/bin/env bash

echo "               _ _    _____  _____                 _            _             "
echo "              | | |  |____ ||  _  |               | |          | |            "
echo "__      ____ _| | | __   / /| |/' |_ __ ___     __| | ___ _ __ | | ___  _   _ "
echo "\ \ /\ / / _\` | | |/ /   \ \|  /| | '_ \` _ \   / _\` |/ _ \ '_ \| |/ _ \| | | |"
echo " \ V  V / (_| | |   <.___/ /\ |_/ / | | | | | | (_| |  __/ |_) | | (_) | |_| |"
echo "  \_/\_/ \__,_|_|_|\_\____/  \___/|_| |_| |_|  \__,_|\___| .__/|_|\___/ \__, |"
echo "                                                         | |             __/ |"
echo "                                                         |_|            |___/ "

echo uploading static files...
aws s3 sync --profile=walk30m --quiet ./httpdocs s3://walk30m
echo done.

echo deploying lambda functions...
echo 1/2 ipInfo...
cd ./lambda && \
	zip -q -r deployment.zip ./ipInfo/* && \
	cdir=`pwd` && \
	aws lambda update-function-code --profile=walk30m --function-name=ipInfo --zip-file=fileb://${cdir}/deployment.zip && \
	rm deployment.zip && \
	cd ../

echo 2/2 createExecutionLog...
	cd ./lambda/executionLog && \
	zip -q -r deployment.zip ./create/* && \
	cdir=`pwd` && \
	aws lambda update-function-code --profile=walk30m --function-name=createExecutionLog --zip-file=fileb://${cdir}/deployment.zip && \
	rm deployment.zip && \
	cd ../../
echo done.

