FROM php:7.1-apache

RUN apt-get update &&\
    apt-get install -y rrdtool &&\
    a2enmod rewrite &&\
    rm -rf /var/lib/apt/lists/*
COPY . /var/www/html/
RUN sed -i "s/\$CONFIG\['graph_type'\].*$/\$CONFIG['graph_type'] = 'canvas';/" /var/www/html/conf/config.php
