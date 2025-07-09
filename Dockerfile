FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Set environment variables
ENV PYTHONPATH=/app/backend
ENV PRODUCTION=true

# Run the application
CMD ["gunicorn", "-c", "gunicorn_conf.py", "--chdir", "backend", "simple_server:app"] 