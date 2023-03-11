# Define custom app directory
ARG FUNCTION_DIR="/app"

FROM python:3.9-slim-buster as build-image

# Install aws-lambda-cpp build dependencies
RUN apt-get update && \
  apt-get install -y \
  g++ \
  make \
  cmake \
  unzip \
  libcurl4-openssl-dev

# Include global arg in this stage of the build
ARG FUNCTION_DIR
# Create function directory
RUN mkdir -p ${FUNCTION_DIR}

# Install the runtime interface client
RUN pip install \
        --target ${FUNCTION_DIR} \
        awslambdaric

# Multi-stage build: grab a fresh copy of the base image
#FROM alpine:3.16
FROM python:3.9-slim-buster

# Include global arg in this stage of the build
ARG FUNCTION_DIR
# Set working directory to function root directory
WORKDIR ${FUNCTION_DIR}

COPY grade.sh ${FUNCTION_DIR}/grade.sh
COPY app.py ${FUNCTION_DIR}/app.py
COPY example-test-code/* /app

# (Optional) Add Lambda Runtime Interface Emulator and use a script in the ENTRYPOINT for simpler local runs
ADD https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie /usr/bin/aws-lambda-rie

# Ensure rights
RUN chmod +x *.sh

RUN adduser user --disabled-password
# Don't let random users run random stuff as root (even in a container)
RUN chown -R user:users ${FUNCTION_DIR}

USER user

# Copy in the build image dependencies
COPY --from=build-image ${FUNCTION_DIR} ${FUNCTION_DIR}

ENTRYPOINT ["/usr/local/bin/python", "-m", "awslambdaric" ]

CMD [ "app.handler" ]
