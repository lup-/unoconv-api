FROM ubuntu AS libreoffice

ENV DEBIAN_FRONTEND noninteractive
ENV LANG='ru_RU.UTF-8'

RUN apt-get -qq -y update \
    && apt-get -q -y dist-upgrade \
    && apt-get -q -y install libreoffice curl unoconv \
    && apt-get -qq -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && localedef -i ru_RU -c -f UTF-8 -A /usr/share/locale/locale.alias ru_RU.UTF-8




FROM node:alpine

ENV LANG='ru_RU.UTF-8'

COPY --from=libreoffice ./ .
COPY . /opt/server
RUN mkdir /opt/server/files


WORKDIR /opt/server
RUN npm install

EXPOSE 3000

CMD [ "node", "index.js" ]

