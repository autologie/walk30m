#!/bin/sh

set -eux

CDIR=`pwd`
SOURCE_DIR=$1
ARCHIVE_PATH=$2

cd $SOURCE_DIR
zip -ry --quiet staging.zip .
cd $CDIR
mv "$SOURCE_DIR/staging.zip" $ARCHIVE_PATH
