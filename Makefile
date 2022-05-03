#!/usr/bin/env make -f
# -*- makefile -*-

SHELL = bash -e


image:
	@docker-compose -p actionsflow-workflow -f docker-compose.yml build --force-rm --pull

start:
	@docker-compose -p actionsflow-workflow -f docker-compose.yml up --remove-orphans -d

dependencies: start
	@docker-compose -p actionsflow-workflow -f docker-compose.yml exec \
		-T --user luisalejandro actionsflow-workflow yarn install

build: start
	@docker-compose -p actionsflow-workflow -f docker-compose.yml exec \
		-T --user luisalejandro actionsflow-workflow yarn run build

clean: start
	@docker-compose -p actionsflow-workflow -f docker-compose.yml exec \
		-T --user luisalejandro actionsflow-workflow yarn run clean

console: start
	@docker-compose -p actionsflow-workflow -f docker-compose.yml exec \
		--user luisalejandro actionsflow-workflow bash

stop:
	@docker-compose -p actionsflow-workflow -f docker-compose.yml stop actionsflow-workflow

down:
	@docker-compose -p actionsflow-workflow -f docker-compose.yml down \
		--remove-orphans

destroy:
	@docker-compose -p actionsflow-workflow -f docker-compose.yml down \
		--rmi all --remove-orphans -v