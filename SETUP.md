# Quick Setup Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js (v14+) installed
- ✅ Python 3.7+ installed
- ✅ PostgreSQL database running
- ✅ Google Gemini API key

## Step-by-Step Setup

### 1. Database Setup

First, create your PostgreSQL database:

```sql
CREATE DATABASE retool;
```

### 2. Backend Configuration

```bash
cd backend
npm install
```

Copy the example environment file:
```bash
# On Windows (PowerShell)
Copy-Item env.example .env

# On Linux/Mac
cp env.example .env
```

Edit `.env` with your database credentials and Gemini API key:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=retool
DB_USER=postgres
DB_PASSWORD=your_actual_password
GEMINI_API_KEY=your_actual_gemini_key
PORT=5000
```

Install Python dependencies and run migration:
```bash
pip install -r requirements.txt
python migrate.py
```

### 3. Frontend Configuration

```bash
cd frontend
npm install
```

Copy the example environment file:
```bash
# On Windows (PowerShell)
Copy-Item env.example .env

# On Linux/Mac
cp env.example .env
```

Edit `.env` if your backend runs on a different port:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 5. Access the Application

Open your browser and navigate to:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health

## Testing the Setup

1. **Health Check**: Visit http://localhost:5000/api/health - should return `{"status":"ok"}`

2. **Upload Test Files**: 
   - Create an Excel file with RRF data (columns: account, rrf_id, pos_title, role, status)
   - Create an Excel file with Bench data (columns: name, skill, open_positions)
   - Upload both files through the UI

3. **Test Matching**: After uploading both files, click "Get Top 5 Candidates per RRF"

## Troubleshooting

### Database Connection Failed
- Check PostgreSQL is running: `pg_isready` or check services
- Verify credentials in `.env`
- Ensure database exists: `psql -U postgres -l`

### Gemini API Errors
- Verify API key is correct
- Check API quota/limits in Google Cloud Console
- Ensure billing is enabled for Gemini API

### Port Already in Use
- Change `PORT` in backend `.env`
- Update `REACT_APP_API_URL` in frontend `.env` accordingly

### Module Not Found Errors
- Run `npm install` in both backend and frontend directories
- Delete `node_modules` and `package-lock.json`, then reinstall
