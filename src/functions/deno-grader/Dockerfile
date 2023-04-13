ARG FUNCTION_DIR="/app"

FROM node:18-buster

# Include global arg in this stage of the build
ARG FUNCTION_DIR

RUN apt-get update && \
    apt-get install -y \
    g++ \
    make \
    cmake \
    unzip \
    libcurl4-openssl-dev

# Copy function code
RUN mkdir -p ${FUNCTION_DIR}
COPY . ${FUNCTION_DIR}

# Set working directory to function root directory
WORKDIR ${FUNCTION_DIR}

#RUN export DENO_DIR="./tmp/deno"
RUN curl -Lo "deno.zip" "https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip" \
    && unzip -d /usr/local/bin deno.zip \
    && rm deno.zip 
RUN deno cache --unstable course_deps.ts \
        test_util/deps/all_test_deps.ts \
        test_util/deps/deno_test_deps.ts \
        test_util/deps/oak_test_deps.ts \
        test_util/deps/postgres_test_deps.ts 

RUN npm install aws-lambda-ric

RUN chmod +x *.sh

ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]
CMD ["app.handler"]
