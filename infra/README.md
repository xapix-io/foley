# Deploying Foley

## Requirements

Foley deployment depends on the following tools and dependencies:

* Docker
* Pulumi command-line tool
* AWS CLI
* Node v14 (LTS)
* Helm Charts v3

More about the [tools here](https://github.com/xapix-io/infra-k8s/blob/master/docs/pulumi-workshop1.md), with links to installation instructions. Note also that this uses helm v3, not v2.

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

The CD setup is lifted mostly from the clojud build, though somewhat simplified. Split into two steps, we have:

### Build

``` yaml
  build:
    if: "!contains(github.event.head_commit.message, 'skip ci')"
    runs-on: ubuntu-latest
    environment: CD
    steps:
    - name: Copy Repo Files
      uses: actions/checkout@master
      with:
        submodules: true
    - name: Publish Foley Base Docker Image to GPR
      uses: ./.github/actions/docker
      env:
        DOCKER_BUILDKIT: 1
      with:
        # check https://github.community/t5/GitHub-Actions/Github-Actions-Docker-login/td-p/29852
        USERNAME: 'xapixbot'
        PASSWORD: ${{ secrets.DOCKER_HUB_PASSWORD }}
        IMAGE_NAME: 'xapixio/foley'
        DOCKERFILE_PATH: './Dockerfile'
        BUILD_CONTEXT: '.'
        BUILD_PARAMS: '--progress plain'
        # CACHE: true
```

Notes:
* use "skip ci" to prevent deployment
* references an `environment`, called "CD" - this is a github secrets abstraction, not entirely sure how useful. However it is a thing which is configured in the Github project settings as the name of a set of secrets for use in builds.
* includes submodules configuration, which clones `xapix-io/foley-frontend` into the `frontend` subdirectory
* uses an action (some code) defined in .github/actions/docker

The code [is very simple](https://github.com/xapix-io/foley/blob/j0ni/ops/.github/actions/docker/index.js) and [is used elsewhere](https://github.com/xapix-io/clojud/blob/master/.github/actions/docker/index.js). 

### Pulumi Deployment to Dev Environment

``` yaml
  deploy-neu:
    runs-on: ubuntu-latest
    environment: CD
    needs: [build]
    steps:
      - uses: actions/checkout@v2
      - run: echo "//npm.pkg.github.com/:_authToken=${{secrets.XAPIXBOT_GITHUB_TOKEN}}" >> .npmrc
        working-directory: ./infra
      - uses: docker://pulumi/actions
        with:
          args: up --yes
        env:
          VERSION: ${{ github.sha }}
          AWS_REGION: eu-west-1
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN_XAPIXBOT }}
          PULUMI_CI: up
          PULUMI_ROOT: infra
```

Notes:
* Note the required secrets
`
