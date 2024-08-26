#!/bin/bash

start_server() {
  # Start a local server for the public directory
  if [ ! -f .serve_local.lock ]; then
    nohup python3 -m http.server 8100 --directory public/ &
    echo $! >.serve_local.lock
    echo "Local server started at port 8100"
  else
    echo "Local server is already running"
  fi
}

stop_server() {
  # Stop the local server if it is running
  if [ -f .serve_local.lock ]; then
    kill $(cat .serve_local.lock)
    rm .serve_local.lock
    echo "Local server stopped"
  else
    echo "Local server is not running"
  fi
}

case "$1" in
  start)
    start_server
    ;;
  stop)
    stop_server
    ;;
  *)
    echo "Invalid argument. Usage: $0 [start|stop]"
    ;;
esac
