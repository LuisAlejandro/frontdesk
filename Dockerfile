FROM dockershelf/node:18-bookworm
LABEL maintainer "Luis Alejandro Martínez Faneyth <luis@luisalejandro.org>"

ARG UID=1000
ARG GID=1000

RUN apt-get update && \
    apt-get install gnupg dirmngr sudo wget

RUN wget https://github.com/twitchdev/twitch-cli/releases/download/v1.1.21/twitch-cli_1.1.21_Linux_arm64.tar.gz -O /tmp/twitch-cli.tar.gz && \
    tar -xzf /tmp/twitch-cli.tar.gz twitch-cli_1.1.21_Linux_arm64/twitch && \
    mv twitch-cli_1.1.21_Linux_arm64/twitch /usr/local/bin/twitch && \
    rm -rf /tmp/twitch-cli.tar.gz && \
    chmod +x /usr/local/bin/twitch

RUN gpg --lock-never --no-default-keyring \
        --keyring /usr/share/keyrings/yarn.gpg \
        --keyserver hkp://keyserver.ubuntu.com:80 \
        --recv-keys 23E7166788B63E1E
RUN echo "deb [signed-by=/usr/share/keyrings/yarn.gpg] https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update && \
    apt-get install yarn

RUN EXISTUSER=$(getent passwd | awk -F':' '$3 == '$UID' {print $1}') && \
    [ -n "${EXISTUSER}" ] && deluser ${EXISTUSER} || true

RUN EXISTGROUP=$(getent group | awk -F':' '$3 == '$GID' {print $1}') && \
    [ -n "${EXISTGROUP}" ] && delgroup ${EXISTGROUP} || true

RUN groupadd -g "${GID}" frontdesk || true
RUN useradd -u "${UID}" -g "${GID}" -ms /bin/bash frontdesk

RUN echo "frontdesk ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/frontdesk

USER frontdesk

RUN mkdir -p \
    /home/frontdesk/app \
    /home/frontdesk/.cache/yarn

WORKDIR /home/frontdesk/app

CMD tail -f /dev/null
