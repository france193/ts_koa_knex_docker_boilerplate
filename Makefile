THIS_FILE := $(lastword $(MAKEFILE_LIST))

help:
	make -pRrq  -f $(THIS_FILE) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$'

build:
	docker compose -f docker-compose.yml --env-file ./docker/.env build ${c}

up:
	docker compose -f docker-compose.yml --env-file ./docker/.env up -d ${c}

start:
	docker compose -f docker-compose.yml --env-file ./docker/.env start ${c}

down:
	docker compose -f docker-compose.yml --env-file ./docker/.env down ${c}

destroy:
	docker compose -f docker-compose.yml --env-file ./docker/.env down -v ${c}

stop:
	docker compose -f docker-compose.yml --env-file ./docker/.env stop ${c}

restart:
	docker compose -f docker-compose.yml --env-file ./docker/.env stop ${c}
	docker compose -f docker-compose.yml --env-file ./docker/.env up -d ${c}

status:
	docker compose -f docker-compose.yml --env-file ./docker/.env ps

statusa:
	docker compose -f docker-compose.yml --env-file ./docker/.env ps -a

test:
	echo ${c}