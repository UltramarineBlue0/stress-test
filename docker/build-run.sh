#!/bin/bash -eux

# Build environment

sudo docker rmi -f local-build:build-environment || :

sudo docker build --compress --force-rm --pull -t local-build:build-environment .

sudo docker run --domainname LOCALNET -h CONTAINER --name npmbuild -u root --init --rm -v ~/git/stress-test:/project -i -t local-build:build-environment /bin/bash -i -l
