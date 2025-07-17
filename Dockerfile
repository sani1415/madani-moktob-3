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

# Run the application using cloud_server.py for automatic database selection with increased timeout
CMD ["gunicorn", "--timeout", "120", "--bind", "0.0.0.0:8080", "--chdir", "backend", "cloud_server:app"]