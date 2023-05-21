FROM public.ecr.aws/lambda/nodejs:18

# Update and install unzip that will be used to install Deno
RUN yum update && \
    yum install -y \
    unzip 

# Copy over code artifacts 
COPY . ${LAMBDA_TASK_ROOT}/

# Install Deno
RUN curl -Lo "deno.zip" "https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip" \
    && unzip -d /usr/local/bin deno.zip \
    && rm deno.zip 

# Set DENO_DIR to store cache dependencies and compile artifacts in to LAMBDA_TASK_ROOT
ENV DENO_DIR=${LAMBDA_TASK_ROOT}

# Cache deno dependencies
RUN deno cache --unstable course_deps.ts \
        test_util/deps/all_test_deps.ts \
        test_util/deps/deno_test_deps.ts \
        test_util/deps/oak_test_deps.ts \
        test_util/deps/postgres_test_deps.ts 

# Install NPM dependencies for function
RUN npm install @aws-sdk/client-dynamodb

# Give scripts excutable permission
RUN chmod +x *.sh

# Set the CMD to the handler
CMD [ "app.handler" ]
