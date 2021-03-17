# Deploying Foley

## Requirements

Foley deployment depends on the following tools and dependencies:

* Docker
* Pulumi command-line tool
* AWS CLI
* Node v14 (LTS)
* Helm Charts v2

More about the [tools here](https://github.com/xapix-io/infra-k8s/blob/master/docs/pulumi-workshop1.md), with links to installation instructions.

## Manual Process

1. Identify a commit SHA which contains the required version of the backend, but also the correct git-submodule is correctly configured.
2. Build and deploy a docker image:

Assuming `FOLEY_ROOT` to contain this project's root directory:
``` sh
$ cd $FOLEY_ROOT
$ docker login
# ... do the login
$ docker build -t xapixio/foley -f Dockerfile .
$ export TAG=$(git rev-parse HEAD)
$ docker tag xapixio/foley:latest xapixio/foley:$TAG
$ docker push xapixio/foley:$TAG
```
3. Tell Pulumi about the update

``` sh
$ cd $FOLEY_ROOT/infra
$ npm install
# Log in as xapixbot - this sends you to a browser window. Creds are in 1Password
$ pulumi login
# ...
$ pulumi stack select dev
$ env VERSION=$TAG pulumi up
```
Now review the proposed changes and respond accordingly.

## CD

