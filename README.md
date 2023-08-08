# Overall

Project is composed by 4 components:

- PostgreSQL instance provided as a docker container
- RabbitMQ instance provided as a docker container
- Public service (shortened as “ps”) → a nodeJS application developed following the given requirements
- Data Aggregation Service (shortened as “das”) → a nodeJS application developed following the given requirements

→ All components can be ran with docker-compose as docker containers so anyone can run the project directly.

# Get Started

→ Ensure you have docker installed on the machine you want to run the projects and to have the Docker daemon up and running

At the root level of the project just run `make up` and docker compose will create 4 services:

- **postgresql**: Postgres database for storage.
- **rabbitmq**: to provide message queuing mechanism in between the two applications (ps and das) ****allowing event creation in an asynchronous fashion to not impact the performances of the project service.
- **The public service:** node.JS application to be used to get informations related to projects and manage deployments. This provides the requested APIs for projects and deployments. For every performed actions (deployment creation, cancellation, status update, ...) a new message with data is sent to a rabbitmq queue with event data, ready to be consumed by the Data Aggregator service.
- **The data aggregation server:** node.Js application that consumes messages from a rabbitmq queue (waits for new events) and stores on the db. Since the Data Aggregation Service is a private service that has the only purpose of aggregating data and is used to create events every time deployments are created/modified/cancelled in the public service, I have decided to follow a different approach than what is indicated in the "instructions.md" file. I used rabbitmq queue in order to provide asynchronous communication between the 2 applications to not impact the performances of the project service. Using RabbitMQ queue has some advantages:
    - Delivery acknowledgments and confirms to increase the reliability of the message queue by reducing message loss (ensure the new event creation).
    - Provides scalability → it should be possible to create multiple “data aggregation server” applications as consumers to provide better scalability.
    
    → As an alternative I wrote the code to create a koa server with the API Endpoint as originally indicated in the requirements which allows the creation of a new event

If you want to run the 2 nodeJs application locally (not with docker) it is possible, but you have to launch only rabbitmq and postgresql as docker instance:
 - run `make up c=postgresql && make up c=rabbitmq`to launch the 2 docker container
 - run `yarn ps:production` to launch public service locally
 - run `yarn das:production` to launch data aggregation service service locally

 I use different config file for different environment:
 - development -> to be used for all dockerized application to communicates with docker service like rabbitmq and postgresql between docker network (instead of localhost it use docker compose service name)
 - production -> to be uses for application locally to communicates with docker service like rabbitmq and postgresql (instead of localhost it use docker compose service name)
 - test it is used to perform tests locally (not inside docker container) and it uses a knex configuration with sqlite instead of postgresql
 - default is for default config settings

# Project structure description

All the project code has been versioned using git and all the code has been developed following the incremental approach with “git flow”. So each feature has been developed as a feature branch and then merged into the development branch and then on master as the version becomes stable.

I decided to organize the project divided into many subfolders by logic function and by endpoint in order to have a very simple and clean organization and make the code easily understandable

I used Visual Studio Code as IDE and this the main project structure:

```jsx
.
├── Makefile
├── README.md
├── config
├── dist
├── docker
│   ├── data_aggregation_service
│   ├── postgresql
│   └── public_service
├── docker-compose.yml
├── docs
├── package.json
├── src
│   ├── controllers
│   ├── das.ts
│   ├── database
│   ├── errors
│   ├── helpers.ts
│   ├── middlewares
│   ├── models
│   ├── ps_app.ts
│   ├── ps_server.ts
│   ├── rabbit.ts
│   └── routes
├── tests
    ├── deployment.test.ts
    ├── deployment_statistics.test.ts
    ├── deployment_webhook.test.ts
    ├── project.test.ts
    └── token.test.ts
```

- Node.JS application can be ran directly locally or as dockerized application
- RabbitMQ and PostgreSQL services are configured to works as docker instances
- At the root level there you can find a Makefile with shortcuts to run docker compose in order to create all the 4 docker containers. Most commonly used command are: `make up`, `make build`, `make destroy`. All commands runs, builds or destroys all the 4 services together but is also possible to specify a single service to be ran, built or destroyed in this way `make up c=rabbitmq` or `make up c=postgresql` , but public_service and data_aggregation_service depends on rabbitmq and postgresql.
- At the root level there is a “config” folder that includes a default confing file and different config files for different environments: “test”, “development”, “local”.
- At the root level there is the “docker-compose.yml” file that describes all the 4 services in order to create docker image and docker containers. All the docker file for each declared services are under the folder “docker”
- At the root level there is the “tests” folder that contains all the tests for each Endpoint APIs divided into different files or features:
    - deployment
    - deployment_statistics → bonus APIs
    - deployment_webhook
    - project
    - token authentication
- Inside the “src” folder there are:
    - the 2 nodejs applications
        - das.ts
        - ps_app.ts & ps_server.ts
    - different subfolder to better organizes the code:
        - database → contains all the code related to db connection with knex: migrations files and seeds files
        - routes → all the endpoints are divided into a proper file divided by model (deployment, project and a general one only for test). Each routes has a proper controller to manage API requests.
        - controllers → as the routes also controllers are divided to provide a better code organizations
        - middlewares → here are all the koa middlewares, in particular here it is the token_middleware to provide token authentication
        - models → all types declarations to reflects ERD table definition
        - errors → custom defined errors

# Model

To better describes all tables and relationships I provide an Entity Relationship Diagram inside the “docs” folder called “Entity Relationship Diagram.pdf”.

# Tests

jest is used to provide unit test and provide code coverage. Currently all tests are setup to be executed with the nodeJs application running locally, not inside docker container, but this should be also configured to work properly on docker container setting up the hostname as the docker compose service name.

On the package.json there are 6 different test scripts:

- test → executes all test files
- test:projects → executes only test related to projects endpoint
- test:statistics → executes only test related to statistics on deployment endpoint
- test:deployments → executes only test related to deployments endpoint
- test:deployments_webhook → executes only test related to webhook on deployment endpoint
- test:token  executes only test related authentication header using a simple endpoint