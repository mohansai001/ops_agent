# Ops Agent - RRF Allocation System

A full-stack web application for automating the allocation of bench employees to open project positions (RRFs) using AI-powered matching.

## Features

- **Professional Dashboard**: Clean, modern UI with sidebar navigation
- **Excel File Upload**: Upload RRF and Bench employee data via Excel files with comprehensive validation
- **Real-time Counts**: Auto-updated dashboard cards showing open RRFs and bench people
- **AI-Powered Matching**: Uses Google Gemini LLM to intelligently match candidates to positions
- **Enhanced Multi-Factor Matching**: Combines LLM scores with rule-based scoring (skills, role, availability)
- **Batch Processing**: Processes large datasets in batches to avoid API timeouts
- **Top 5 Candidates**: Returns the best-matched candidates per RRF with scores and reasoning
- **Data Validation**: Comprehensive input validation with data quality checks and warnings
- **Upload History**: Track all file uploads with timestamps and validation results
- **Data Snapshots**: Automatic snapshots before data replacement for easy rollback
- **Trend Analysis**: Analytics dashboard showing RRF volume, bench size, and matching score trends
- **Excel Export**: Download matching results as formatted Excel files

## Tech Stack

- **Frontend**: React 18
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (Retool DB)
- **AI/LLM**: Google Gemini API
- **File Processing**: xlsx library for Excel parsing

## Prerequisites

- Node.js (v14 or higher)
- Python 3.7+ (for migration script)
- PostgreSQL database
- Google Gemini API key

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd ops-agent
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

**Option 1: Using connection string (recommended for Retool DB):**
```env
DATABASE_URL=postgresql://retool:password@host:port/retool?sslmode=require
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
PORT=5000
```

**Option 2: Using individual parameters:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=retool
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SSL=false
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
PORT=5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Database Setup

Install Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Run the migration script to create tables:

```bash
python migrate.py
```

This will create:
- `rrf` table with columns: account, rrf_id, pos_title, role, status
- `bench` table with columns: name, skill, open_positions

## Running the Application

### Start the Backend

```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### Start the Frontend

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Upload RRF File**: Upload an Excel file containing open positions with columns:
   - account
   - rrf_id
   - pos_title (or position_title, title)
   - role
   - status

2. **Upload Bench File**: Upload an Excel file containing bench employees with columns:
   - name
   - skill (or skills)
   - open_positions (or open_pos, openpositions)

3. **View Counts**: The dashboard will automatically show the count of uploaded RRFs and bench people.

4. **Match Candidates**: Click "Get Top 5 Candidates per RRF" to trigger the AI matching process. The system will:
   - Fetch all RRFs and bench employees
   - Send them to Gemini LLM for analysis
   - Return the top 5 best-matched candidates per RRF with scores and reasoning

5. **Download Results**: After matching, click "📥 Download Excel" to export all matching results to an Excel file with all candidate details, scores, and reasoning.

## API Endpoints

### `POST /api/upload/rrf`
Upload and parse RRF Excel file.

**Request**: Multipart form data with `file` field

**Response**:
```json
{
  "message": "RRF file uploaded and processed successfully",
  "count": 10
}
```

### `POST /api/upload/bench`
Upload and parse Bench Excel file.

**Request**: Multipart form data with `file` field

**Response**:
```json
{
  "message": "Bench file uploaded and processed successfully",
  "count": 25
}
```

### `GET /api/counts`
Get current counts of RRFs and bench people.

**Response**:
```json
{
  "rrfCount": 10,
  "benchCount": 25
}
```

### `POST /api/match-candidates`
Get top 5 matched candidates for each RRF using Gemini LLM with batch processing and enhanced matching.

**Request Body** (optional):
```json
{
  "useEnhancedMatching": true,
  "batchSize": 5,
  "weights": {
    "skillMatch": 0.4,
    "roleMatch": 0.3,
    "availability": 0.2,
    "accountMatch": 0.1
  }
}
```

**Response**:
```json
{
  "matches": [
    {
      "rrf": {
        "account": "Client A",
        "rrf_id": "RRF-001",
        "pos_title": "Senior Developer",
        "role": "Backend",
        "status": "open"
      },
      "candidates": [
        {
          "name": "John Doe",
          "skill": "Python, Node.js, PostgreSQL",
          "score": 92,
          "reasoning": "Strong match with required backend skills"
        },
        ...
      ]
    }
  ],
  "batchCount": 2,
  "enhancedMatching": true
}
```

### `GET /api/upload-history`
Get upload history with validation results.

**Query Parameters**:
- `fileType` (optional): Filter by 'RRF' or 'Bench'
- `limit` (optional): Number of records to return (default: 50)

**Response**:
```json
{
  "history": [
    {
      "id": 1,
      "file_type": "RRF",
      "file_name": "rrfs.xlsx",
      "row_count": 10,
      "uploaded_at": "2024-01-15T10:30:00Z",
      "validation_errors": null,
      "validation_warnings": ["Row 5: Unusual status value"]
    }
  ]
}
```

### `GET /api/snapshots`
Get available data snapshots for rollback.

**Query Parameters**:
- `fileType`: 'RRF' or 'Bench' (required)

**Response**:
```json
{
  "snapshots": [
    {
      "snapshot_id": "snapshot_1234567890_abc123",
      "timestamp": "2024-01-15T10:30:00Z",
      "count": 10
    }
  ]
}
```

### `POST /api/revert-snapshot`
Revert data to a previous snapshot.

**Request Body**:
```json
{
  "snapshotId": "snapshot_1234567890_abc123",
  "fileType": "RRF"
}
```

### `GET /api/trends/summary`
Get trend analysis summary.

**Query Parameters**:
- `days` (optional): Number of days to analyze (default: 30)

**Response**:
```json
{
  "current": {
    "rrfCount": 10,
    "benchCount": 25
  },
  "uploads": [
    {
      "file_type": "RRF",
      "upload_count": 5,
      "total_rows": 50
    }
  ],
  "matching": {
    "unique_rrfs_matched": 8,
    "total_matches": 40,
    "avg_match_score": 85.5
  }
}
```

### `GET /api/trends/rrf-volume`
Get RRF volume trends over time.

### `GET /api/trends/bench-size`
Get bench size trends over time.

### `GET /api/trends/matching-scores`
Get matching score trends over time.

### `POST /api/download-matches`
Download matching results as an Excel file.

**Request Body**:
```json
{
  "matches": [
    {
      "rrf": { ... },
      "candidates": [ ... ]
    }
  ]
}
```

**Response**: Excel file (.xlsx) with columns:
- RRF ID, Account, Position Title, Role, Status
- Candidate Rank, Candidate Name, Match Score
- Candidate Skills, Open Positions, Matching Reasoning

## Excel File Format

### RRF File Format
The system automatically normalizes column headers. Supported column name variations:
- `account`, `Account`, `ACCOUNT`
- `rrf_id`, `rrfid`, `RRF_ID`, `RRF ID`
- `pos_title`, `position_title`, `title`, `Position Title`
- `role`, `Role`, `ROLE`
- `status`, `Status`, `STATUS`

### Bench File Format
Supported column name variations:
- `name`, `Name`, `NAME`
- `skill`, `skills`, `Skill`, `Skills`
- `open_positions`, `open_pos`, `openpositions`, `Open Positions`

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string (recommended for Retool DB). Format: `postgresql://user:password@host:port/database?sslmode=require`
- `DB_HOST`: PostgreSQL host (default: localhost) - used if DATABASE_URL not provided
- `DB_PORT`: PostgreSQL port (default: 5432) - used if DATABASE_URL not provided
- `DB_NAME`: Database name (default: retool) - used if DATABASE_URL not provided
- `DB_USER`: Database user (default: postgres) - used if DATABASE_URL not provided
- `DB_PASSWORD`: Database password - used if DATABASE_URL not provided
- `DB_SSL`: Enable SSL for database connection (default: false) - used if DATABASE_URL not provided
- `GEMINI_API_KEY`: Google Gemini API key (required)
- `GEMINI_URL`: Gemini API endpoint (optional, has default)
- `PORT`: Backend server port (default: 5000)

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000/api)

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check that the database exists

### Gemini API Issues
- Verify your API key is correct
- Check API quota/limits
- Ensure the API endpoint URL is correct

### File Upload Issues
- Ensure Excel files are in `.xlsx` or `.xls` format
- Check that files have proper headers
- Verify file size is reasonable

## License

MIT
