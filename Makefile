.PHONY: setup dev run-api test format migrate

setup: ; pip install -r requirements.txt

dev: ; uvicorn api.app:app --reload --host 127.0.0.1 --port 8000

run-api: ; uvicorn api.app:app --host 127.0.0.1 --port 8000

test: ; pytest

format: ; @echo "No formatter configured"

migrate: ; @echo "No migrations to run"
