"""Gunicorn configuration for Madani Maktab.

This file tunes worker count and time-outs for production use.  Gunicorn will
pick it up when started with `-c gunicorn_conf.py`.
"""

import multiprocessing
import os

# Choose workers automatically based on available CPUs unless overridden
workers = int(os.getenv("WEB_CONCURRENCY", max(2, multiprocessing.cpu_count() * 2 + 1)))
threads = int(os.getenv("GUNICORN_THREADS", 2))

bind = os.getenv("BIND", "0.0.0.0:8080")

# Time-outs (seconds)
timeout = int(os.getenv("GUNICORN_TIMEOUT", 60))
graceful_timeout = int(os.getenv("GUNICORN_GRACEFUL_TIMEOUT", 30))
keepalive = int(os.getenv("GUNICORN_KEEPALIVE", 5))

loglevel = os.getenv("GUNICORN_LOG_LEVEL", "info")
accesslog = "-"  # stdout
errorlog = "-"