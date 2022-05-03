FROM dockershelf/node:14
LABEL maintainer "Luis Alejandro Martínez Faneyth <luis@collagelabs.org>"

RUN apt-get update && \
    apt-get install gnupg dirmngr sudo

RUN dirmngr --debug-level guru

RUN gpg --lock-never --no-default-keyring \
        --keyring /usr/share/keyrings/yarn.gpg \
        --keyserver hkp://keyserver.ubuntu.com:80 \
        --recv-keys 23E7166788B63E1E
RUN echo "deb [arch=amd64 signed-by=/usr/share/keyrings/yarn.gpg] https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update && \
    apt-get install yarn

RUN useradd -ms /bin/bash luisalejandro
RUN echo "luisalejandro ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/luisalejandro

USER luisalejandro

RUN mkdir -p /home/luisalejandro/app

WORKDIR /home/luisalejandro/app

CMD tail -f /dev/null
