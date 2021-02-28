#!/bin/bash

echo What version is this?
read VERSION

docker build -t sebastian2772/reddit-clone:$VERSION .
docker push sebastian2772/reddit-clone:$VERSION
ssh root@159.89.91.86 "docker pull sebastian2772/reddit-clone:$VERSION && docker tag sebastian2772/reddit-clone:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"