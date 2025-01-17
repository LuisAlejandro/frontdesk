#!/usr/bin/env make -f
# -*- makefile -*-

SHELL = bash -e
all_ps_hashes = $(shell docker ps -q)
img_hash = $(shell docker images -q luisalejandro/frontdesk:latest)
exec_on_docker = docker compose \
	-p frontdesk -f docker-compose.yml exec \
	--user frontdesk app


image:
	@docker compose -p frontdesk -f docker-compose.yml build \
		--build-arg UID=$(shell id -u) \
		--build-arg GID=$(shell id -g)

start:
	@if [ -z "$(img_hash)" ]; then\
		make image;\
	fi
	@docker compose -p frontdesk -f docker-compose.yml up \
		--remove-orphans --no-build --detach

dependencies: start
	@$(exec_on_docker) yarn install

run: start
	@$(exec_on_docker) yarn run last-rss-entries

console: start
	@$(exec_on_docker) bash

twitch-create-subscription: start
	@$(exec_on_docker) yarn ts-node scripts/twitch/create-subscription.ts

twitch-list-subscriptions: start
	@$(exec_on_docker) yarn ts-node scripts/twitch/list-subscriptions.ts

twitch-delete-subscriptions: start
	@$(exec_on_docker) yarn ts-node scripts/twitch/delete-subscriptions.ts

gymcontrol-create-license: start
	@$(exec_on_docker) yarn ts-node scripts/gymcontrol/create-license.ts

stop:
	@docker-compose -p frontdesk -f docker-compose.yml stop app

down:
	@docker-compose -p frontdesk -f docker-compose.yml down \
		--remove-orphans

destroy:
	@echo
	@echo "WARNING!!!"
	@echo "This will stop and delete all containers, images and volumes related to this project."
	@echo
	@read -p "Press ctrl+c to abort or enter to continue." -n 1 -r
	@docker compose -p agoras -f docker-compose.yml down \
		--rmi all --remove-orphans --volumes

cataplum:
	@echo
	@echo "WARNING!!!"
	@echo "This will stop and delete all containers, images and volumes present in your system."
	@echo
	@read -p "Press ctrl+c to abort or enter to continue." -n 1 -r
	@if [ -n "$(all_ps_hashes)" ]; then\
		docker kill $(shell docker ps -q);\
	fi
	@docker compose -p agoras -f docker-compose.yml down \
		--rmi all --remove-orphans --volumes
	@docker system prune -a -f --volumes