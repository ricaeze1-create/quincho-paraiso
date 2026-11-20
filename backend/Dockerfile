FROM php:8.3-apache-bookworm

ENV APP_ENV=production \
    APP_DEBUG=false \
    SESSION_DRIVER=array \
    CACHE_STORE=array \
    LOG_CHANNEL=stderr

RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip \
    && rm -rf /var/lib/apt/lists/* \
    && sed -i 's/^Listen 80$/Listen 10000/' /etc/apache2/ports.conf

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/html
COPY composer.json composer.lock ./
RUN COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --prefer-dist --no-interaction --no-progress

COPY . .
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf
RUN mkdir -p bootstrap/cache storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs \
    && chown -R www-data:www-data bootstrap/cache storage

EXPOSE 10000
