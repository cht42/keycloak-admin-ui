FROM node:16-alpine

WORKDIR /app

COPY entrypoint.sh /entrypoint.sh

CMD /entrypoint.sh