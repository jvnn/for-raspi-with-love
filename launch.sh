#!/bin/bash


# This is from StackOverflow:
# http://stackoverflow.com/a/246128/2071242
# The code makes sure that DIR will point to the directory of
# the launch script no matter what kinds of symlinking is going on

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"

  # if $SOURCE was a relative symlink, we need to resolve it relative
  # to the path where the symlink file was located
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

# End of StackOverflow magic...


PYTHON_DIR="$DIR/src/python"
NODE_DIR="$DIR/src/node"
WWW_DIR="$DIR/www"


if [ -z $1 ]
then
	echo "Either provide a music directory or --kill"
	exit 1
fi

if [ $1 = "--kill" ]
then
	PYTHON_PID=`cat /tmp/pi-framework-python-pid`
	NODE_PID=`cat /tmp/pi-framework-node-pid`
	if [ -n $PYTHON_PID ] && [ -n $NODE_PID ]
	then
		kill $PYTHON_PID
		kill $NODE_PID
		rm /tmp/pi-framework-python-pid
		rm /tmp/pi-framework-node-pid
	fi
	exit 0
fi

cd $PYTHON_DIR
if command -v python2 > /dev/null; then
	PYTHON_CMD=python2
else
	PYTHON_CMD=python
fi
$PYTHON_CMD control.py $1 &
cd -
echo "$!" > /tmp/pi-framework-python-pid
sleep 2
node $NODE_DIR/web-interface.js $WWW_DIR &
echo "$!" > /tmp/pi-framework-node-pid
