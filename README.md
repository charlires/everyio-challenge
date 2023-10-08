# CHALLENGE
https://github.com/every-io/engineering-interivew-be

## Project setup
To setup this project you have a multiple of options  

### Using Docker (most convenient)
Install Docker in your computer    
https://docs.docker.com/get-docker/

Use this command
```sh
docker-compose up
```

### Using NodeJS CLI
To run this project you need to have nodejs18 installed and mongodb running in your local computer

```sh
npm i
npm run build
npm start
```

Run tests
```sh
npm test
```
### Run using Devcontainer (if you are a maintainer)
Run project as devcontainer, this option requires Docker and VSCode to be installed in your computer

https://code.visualstudio.com/download  
https://docs.docker.com/get-docker/   

In vscode open your command palette and run `Dev Containers: Reopen in Container` and wait for it to finish 

Use the same commands as for NodeJS CLI inside de devcontainer

reference: https://code.visualstudio.com/docs/devcontainers/containers 

## General Notes

### GraphQL 

### Unit tests
For time contrains only unittest for the busines logic have been inplemented
you can find them in [resolver.test.ts](src/resolver.test.ts)

### Authentication
For simplicity in this challenge authentication and jwt token validation was omited
When the docker-compose runs 3 users are created with the following email and role
- carlos@every.io - MEMBER
- jose@every@io - MEMBER
- admin@every.io - MEMBER

these users are created when the mongodb container runs for the first time
see: mongo-init.js

# TODOs, Improvements, Most have:
- add integration tests
- add cors headers
- add graphql mapper to return dates as rfc3999
- add jwt token validation