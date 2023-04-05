# Define custom function directory
ARG FUNCTION_DIR="/app"

FROM denoland/deno:debian-1.29.2 as build-image
ARG DEBIAN_FRONTEND=noninteractive

# Include global arg in this stage of the build
ARG FUNCTION_DIR

# Update sources
RUN sed -i 's/debian-security stable\/updates/debian-security stable-security/' /etc/apt/sources.list
## Add deps for chromium - related issue at https://github.com/lucacasonato/deno-puppeteer/issues/16
RUN apt-get -qq update --allow-releaseinfo-change \
    && apt-get -qq install -y --no-install-recommends \
    curl \
    ca-certificates \
    unzip \
# ↓ https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix
# Since I want to leave the contents of troubleshooting.md as it is, ca-certificates is intentionally duplicated here.
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
# ↑ https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix
# ↓ Added based on the information obtained from by console.log(line) at https://deno.land/x/puppeteer@9.0.0/src/deno/BrowserRunner.ts#L168.
    libdrm2 \
    libxkbcommon0 \
    libxshmfence1 \
# ↑ Added based on the information obtained from by console.log(line) at https://deno.land/x/puppeteer@9.0.0/src/deno/BrowserRunner.ts#L168.
    && apt-get -qq remove --purge -y \
    curl \
# Do not remove ca-certificates as it is required by puppeteer.
#    ca-certificates \
    unzip \
    && apt-get -y -qq autoremove \
    && apt-get -qq clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Add puppeteer (also downloads chromium) - note that the version here is linked to the
# export in grade.sh
RUN PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@16.2.0/install.ts


# Copy function code
RUN mkdir -p ${FUNCTION_DIR}
COPY . ${FUNCTION_DIR}

WORKDIR ${FUNCTION_DIR}

RUN deno cache --unstable course_deps.ts \
    test_util/deps/all_test_deps.ts \
    test_util/deps/deno_test_deps.ts \
    test_util/deps/oak_test_deps.ts \
    test_util/deps/postgres_test_deps.ts

# Grab a fresh slim copy of the image to reduce the final size
FROM node:12-buster

# Include global arg in this stage of the build
ARG FUNCTION_DIR

RUN apt-get update && \
    apt-get install -y \
    g++ \
    make \
    cmake \
    unzip \
    libcurl4-openssl-dev

# Set working directory to function root directory
WORKDIR ${FUNCTION_DIR}

# Copy in the built dependencies
COPY --from=build-image ${FUNCTION_DIR} ${FUNCTION_DIR}
COPY --from=build-image /usr/local/bin /usr/local/bin

RUN curl -Lo "deno.zip" "https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip"
RUN unzip -d /usr/local/bin deno.zip

COPY grade.sh ${FUNCTION_DIR}/grade.sh
COPY format.sh ${FUNCTION_DIR}/format.sh
COPY deno-test-results-to-json.ts ${FUNCTION_DIR}/deno-test-results-to-json.ts

RUN npm install aws-lambda-ric

RUN chmod +x *.sh

ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]
CMD ["app.handler"]
