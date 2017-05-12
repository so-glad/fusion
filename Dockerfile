#+++++++++++++++++++++++++++++++++++#
# Fuxion Docker container in Alpine #
#+++++++++++++++++++++++++++++++++++#

FROM soglad/node:7.10.0-alpine
LABEL vendor=Glad.so
MAINTAINER Palmtale <palmtale@glad.so>

ENV APP_HOME=/usr/local \
    APP_ENV=1.0.1 \
    APP_PORT=5000

COPY dist $APP_HOME/

RUN set -ex \
    && cd $APP_HOME \
    && sed -i '4s/src\/test\/js/lib/' $APP_HOME/etc/config.json \
    && sed -i '5s/src\/test\/resources/etc/' $APP_HOME/etc/config.json \
    && sed -i '6s/src\/test\/web/web/' $APP_HOME/etc/config.json \
    && sed -i '6s/src\/test\/web/web/' $APP_HOME/etc/config.json \
    && sed -i '52s/..\/..\/main\/js/./' $APP_HOME/lib/main.js \
    && sed -i '54s/resources/etc/' $APP_HOME/lib/main.js \
    && npm config set strict-ssl false \
    && npm config set registry https://pub.glad.so/repository/npm \
    && echo -e '#!/bin/sh\n\
\n\
if [ -d $APP_HOME/node_modules ]; then\n\
    npm update\n\
else\n\
    apk add -U build-base python2\n\
    npm install\n\
    apk del build-base python2\n\
fi\n\
\n\
exec "$@"' >> /usr/local/bin/entry \
    && chmod u+x /usr/local/bin/entry

WORKDIR $APP_HOME
HEALTHCHECK --interval=5m --timeout=3s CMD curl -f http://localhost:$APP_PORT/ || exit 1
ENTRYPOINT ["entry"]
CMD ["npm", "run", "start"]