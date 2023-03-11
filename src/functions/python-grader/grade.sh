#!/bin/bash

cd /app

PYTHONUNBUFFERED=1 timeout 10 python3 -m unittest test-code.py > /tmp/program-output.out 2> /tmp/grading-output.out
mv /tmp/grading-output.out /tmp/result.data
