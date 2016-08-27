#! /usr/bin/env bash

echo "               _ _    _____  _____                 _            _             "
echo "              | | |  |____ ||  _  |               | |          | |            "
echo "__      ____ _| | | __   / /| |/' |_ __ ___     __| | ___ _ __ | | ___  _   _ "
echo "\ \ /\ / / _\` | | |/ /   \ \|  /| | '_ \` _ \   / _\` |/ _ \ '_ \| |/ _ \| | | |"
echo " \ V  V / (_| | |   <.___/ /\ |_/ / | | | | | | (_| |  __/ |_) | | (_) | |_| |"
echo "  \_/\_/ \__,_|_|_|\_\____/  \___/|_| |_| |_|  \__,_|\___| .__/|_|\___/ \__, |"
echo "                                                         | |             __/ |"
echo "                                                         |_|            |___/ "

echo deploying frontend assets...
cd ./httpdocs
./deploy.sh
cd ../
echo done.

echo deploying lambda functions...
cd ./lambda
./deploy.sh
cd ../
echo done.

