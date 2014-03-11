#!/bin/sh
#
# Simple rsync from hb-ui to hb-api/public for quick dev turnaround
#
export HB_UI_HOME=/home/patrick/Documents/hb/5/workspace/hb-ui/
export HB_API_HOME=/home/patrick/Documents/hb/5/workspace/hb-api/
cd ${HB_UI_HOME}/main
grunt
rsync -avuzb --exclude-from ${HB_UI_HOME}'/exclude-list.txt' ${HB_UI_HOME}/main/ ${HB_API_HOME}/public/ 

