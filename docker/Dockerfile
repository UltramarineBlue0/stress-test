FROM node:lts-buster

SHELL ["/bin/bash", "-l", "-c"]
USER root

VOLUME /project

CMD ["/bin/bash", "-i", "-l"]

RUN cd / \
	&& git clone https://github.com/emscripten-core/emsdk.git \
	&& cd ./emsdk \
	&& git pull \
	&& ./emsdk install latest \
	&& ./emsdk activate latest \
	&& source ./emsdk_env.sh
