FROM postgres:9.6

ENV SCWS_VERSION 1.2.3
ENV PG_MAJOR 9.6

RUN echo "deb http://ftp2.cn.debian.org/debian/ jessie main non-free contrib \n\
deb http://ftp2.cn.debian.org/debian/ jessie-updates main non-free contrib \n\
deb http://ftp2.cn.debian.org/debian/ jessie-backports main non-free contrib \n\
deb http://ftp2.cn.debian.org/debian-security/ jessie/updates main non-free contrib \n\
deb-src http://ftp2.cn.debian.org/debian/ jessie main non-free contrib \n\
deb-src http://ftp2.cn.debian.org/debian/ jessie-updates main non-free contrib \n\
deb-src http://ftp2.cn.debian.org/debian/ jessie-backports main non-free contrib \n\
deb-src http://ftp2.cn.debian.org/debian-security/ jessie/updates main non-free contrib" > /etc/apt/sources.list

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates wget \
    && apt-get install -y tar make gcc
RUN apt-get install -y postgresql-server-dev-$PG_MAJOR
RUN mkdir -p /build
ADD scws-$SCWS_VERSION.tar.bz2 /build/
ADD zhparser-master.tar.gz /build/
RUN echo "compile scws"
RUN cd /build/scws-$SCWS_VERSION ; ./configure ; make install ; cd .. \
    && rm -rf scws-$SCWS_VERSION
RUN echo "compile zhparser"
RUN cd /build/zhparser-master ; SCWS_HOME=/usr/local make && make install ; cd .. \
    && rm -rf zhparser-master
RUN apt-get purge -y --auto-remove ca-certificates wget postgresql-server-dev-$PG_MAJOR make gcc
ADD init.sql /docker-entrypoint-initdb.d/