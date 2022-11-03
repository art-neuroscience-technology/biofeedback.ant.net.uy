#!/bin/bash


echo 'killing biofeedback'
ID=$(ps faux | grep python | grep biofeedback | awk '{print $2}')
kill -9
sleep 10
rm -f /tmp/biofeedback.log

echo 'starting biofeedback'

cd /home/pi/biofeedback.ant.net.uy; export PORT=8080; npm start >> /tmp/biofeedback.log 2>&1 & 
