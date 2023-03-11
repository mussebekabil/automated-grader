import os
import json
def handler(event, context):
    print("event generated from queue")
    print(event)

    os.popen('./grade.sh').read()
    file = open('/tmp/result.data', 'r')
    lines = file.readlines()
    message = ''
    for index, line in enumerate(lines):
        print("Line {}: {}".format(index, line.strip()))
        message += line.strip() + "\n"
    file.close()
    
    return json.dumps({ "message": message })
    
