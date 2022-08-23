# Viking Ball Minigame - Server

A minigame to showcase the technology behind Northern Guilds.

[![viking-ball-logo-wip.png](https://i.postimg.cc/8zndGtx0/viking-ball-logo-wip.png)](https://postimg.cc/pmz5YYWf)

## Running the server

First, install the dependencies:

```bash
$ yarn
```

Then you can use either command to start the server locally:

```bash
$ yarn start # builds and starts the server
# or
$ yarn start:dev # starts the server directly, with ts-node-dev (no build)
```

By default, the server will run on port `8000`.

## Docker

Docker has been configured with this application, you can find more details on `Dockerfile` and `docker-compose.yml`.

You can build and run a docker image with:

```bash
$ docker build -t viking-ball-server . # you can give it whatever name/tag you want, in this case, viking-ball-server
$ docker run -d -t viking-ball-server # -d for detached mode. this will spin up a container with the image
```

### Docker Compose and Viking Ball Client

This application was made to run with the [Viking Ball Client](https://github.com/pixieinteractive/ng-client-vikingball). In order for them to communicate, we set up `docker-compose`.

To run the client connected to the server, you just need to run this on both repositories:

```bash
$ docker-compose up -d # -d for detached mode
# or
$ docker compose up -d # on Windows, the command is "docker compose" instead of "docker-compose"
```

The `docker-compose.yml` file sets up a network called `pixie`, which is used by both applications. Furthermore, a `.env` file exists with a `COMPOSE_PROJECT_NAME` that is the same between the two applications. This makes it so that both applications can see each other, and are part of the same "project".

You can find more information on this approach [on this Gist](https://gist.github.com/brunodb3/3e0fdb5739be0c7f14daa7444d1acb78) (forked from user juanje).

## Pixie Interactive - 2022
