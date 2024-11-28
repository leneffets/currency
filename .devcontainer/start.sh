#!/bin/bash

# run as root

apt-get update
apt-get install -y lighttpd
apt-get clean

lighttpd -f lighttpd.conf