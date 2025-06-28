# Madani Maktab

This project contains a small Flask server and a static web client used for student attendance management.

## Requirements

- Python 3.11+
- Node.js 20 (for optional TypeScript utilities)
- PostgreSQL database (URL provided via `DATABASE_URL`)

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Install Node dependencies (optional, for `server/db.ts`):

```bash
npm install
```

## Running

Start the Flask server on port 5000:

```bash
python database_server.py
```

The frontend is served from the same directory, so open `http://localhost:5000` in your browser.

## Testing

A small test suite is provided using `pytest`.
Run it with:

```bash
pytest
```
