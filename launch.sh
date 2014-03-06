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


RUBY_DIR="$DIR/src/ruby"
NODE_DIR="$DIR/src/node"
WWW_DIR="$DIR/www"

ruby -C $RUBY_DIR $RUBY_DIR/control.rb &
node $NODE_DIR/web-interface.js $WWW_DIR &
