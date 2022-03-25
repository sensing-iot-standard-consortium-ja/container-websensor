FROM node:14-buster
COPY ./package.json /package.json
RUN yarn install
COPY ./ /
RUN yarn build

EXPOSE 3000
ENV HOST=0.0.0.0

CMD ["yarn", "start"]