# Online Judge

A mini online coding judge built from scratch to understand how platforms such as LeetCode and Codeforces execute, evaluate, and manage programming submissions.

The system accepts C++ submissions, places them in a database-backed queue, executes them inside isolated Docker containers, evaluates the output against test cases, and stores the resulting verdict and execution metrics.

---

## Features

- User registration and JWT-based authentication
- Problem browsing with difficulty levels
- C++ code submission
- Public and hidden test cases
- Asynchronous submission processing
- PostgreSQL-backed submission queue
- Multiple concurrent judge workers
- Docker-based execution sandbox
- CPU, memory, process, network, filesystem, and wall-clock restrictions
- Automatic compilation and execution
- Output normalization and comparison
- Submission history
- Detailed submission results
- Execution time measurement
- Memory usage measurement
- Automatic recovery of stale submissions
- Concurrent submission testing

---

## Architecture

```text
                         +-----------------+
                         |      User       |
                         +--------+--------+
                                  |
                                  v
                         +-----------------+
                         | React + Vite    |
                         |    Frontend     |
                         +--------+--------+
                                  | HTTP
                                  v
                         +-----------------+
                         | Express Backend |
                         |      API        |
                         +--------+--------+
                                  |
                     +------------+------------+
                     |                         |
                     v                         v
              +--------------+         +--------------+
              |  PostgreSQL  |         |     Auth     |
              |   Database   |         |     / JWT    |
              +------+-------+         +--------------+
                     |
                     | PENDING submissions
                     v
              +--------------+
              | Judge Worker |
              +------+-------+
                     |
                     v
              +--------------+
              | Judge Logic  |
              +------+-------+
                     |
                     v
              +--------------+
              |    Docker    |
              |    Sandbox   |
              +------+-------+
                     |
              Compile + Execute
                     |
                     v
              +--------------+
              |  Test Cases  |
              +------+-------+
                     |
                     v
              +--------------+
              |    Verdict   |
              +--------------+
```

---

## Submission Flow

When a user submits code:

```text
1. User submits C++ code
        |
2. Backend validates the request
        |
3. Submission is stored as PENDING
        |
4. Judge worker claims the submission
        |
5. Submission becomes RUNNING
        |
6. Judge retrieves the problem's test cases
        |
7. Code is compiled inside Docker
        |
8. Compiled program is executed against test cases
        |
9. Output is compared with expected output
        |
10. Final verdict and execution metrics are stored
```

The API does not wait for the entire judging process to finish. The submission is queued and processed asynchronously by the worker.

---

## Why Use a Queue?

Code execution can take significantly longer than a normal API request.

Instead of keeping the HTTP request open while code is compiled and executed, the backend stores the submission with a `PENDING` status.

A separate worker processes it:

```text
API
 |
 +-- Store submission
 |
 +-- Return response
          |
          v
      PostgreSQL
          |
          v
     Judge Worker
          |
          v
     Docker Sandbox
```

This separates request handling from potentially expensive code execution.

---

## Concurrent Workers

The judge supports multiple worker processes.

Workers claim pending submissions using PostgreSQL row locking:

```sql
FOR UPDATE SKIP LOCKED
```

This allows multiple workers to safely process different submissions without taking the same job.

Conceptually:

```text
                PostgreSQL Queue
                +---------------+
                | Submission 1  |
                | Submission 2  |
                | Submission 3  |
                | Submission 4  |
                | Submission 5  |
                +-------+-------+
                        |
              +---------+---------+
              |         |         |
              v         v         v
          Worker 1   Worker 2   Worker 3
              |         |         |
              v         v         v
           Docker     Docker     Docker
```

`SKIP LOCKED` allows a worker to skip rows currently being processed by another worker.

---

## Handling Worker Failures

Submissions that enter the `RUNNING` state record a `started_at` timestamp.

If a submission remains in `RUNNING` for longer than the configured recovery threshold, it can be returned to the `PENDING` state.

This prevents an interrupted worker from leaving submissions stuck indefinitely.

---

## Docker Execution Sandbox

User-submitted code is never executed directly on the main Node.js server process.

The judge runs submitted programs inside Docker containers with restrictions including:

```text
CPU limit
Memory limit
Process limit
Network disabled
Read-only filesystem
Temporary writable /tmp
Wall-clock timeout
```

Current execution configuration includes:

- 1 CPU
- 256 MB memory
- 64 process limit
- No network access
- Read-only container filesystem
- 64 MB writable temporary filesystem
- 5 second per-program execution limit
- Additional outer Docker execution timeout

These restrictions reduce the impact of programs that consume excessive resources or attempt to run indefinitely.

> The sandbox is designed as a project-level isolated execution environment and should not be considered a production-grade security boundary without further hardening.

---

## Judging

The judge supports the following verdicts:

| Verdict | Meaning |
|---|---|
| `ACCEPTED` | All test cases produced the expected output |
| `WRONG_ANSWER` | Program output differed from expected output |
| `RUNTIME_ERROR` | Program failed during execution |
| `COMPILATION_ERROR` | Program failed to compile |
| `TIME_LIMIT_EXCEEDED` | Program exceeded the configured execution limit |
| `MEMORY_LIMIT_EXCEEDED` | Program exceeded the configured memory limit |
| `PENDING` | Submission is waiting to be processed |
| `RUNNING` | Submission is currently being judged |

---

## Output Comparison

Program output is normalized before comparison.

Whitespace differences such as:

```text
0 1
```

and

```text
0    1
```

are treated as equivalent.

The judge tokenizes output based on whitespace and compares the resulting tokens with the expected output.

---

## Execution Metrics

The judge records:

- Execution time
- Memory usage
- Submission status
- Failed test case
- Error details
- Submission timestamp

Execution time is measured around the submitted program's execution inside the container rather than including queue wait time or API request time.

---

## Database

PostgreSQL stores the main application data.

### Main tables

```text
users
  |
  +-- submissions
          |
          +-- problems
                  |
                  +-- test_cases
```

### `users`

Stores registered users and password hashes.

### `problems`

Stores problem statements, constraints, and difficulty.

### `test_cases`

Stores input/output pairs for each problem and identifies hidden test cases.

### `submissions`

Stores submitted code, verdicts, execution metrics, and relationships to users and problems.

The submission table also stores the current processing state:

```text
PENDING
   |
RUNNING
   |
FINAL VERDICT
```

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- JWT authentication

### Database

- PostgreSQL

### Code Execution

- Docker
- GCC / g++

### Testing

- REST Client
- Concurrent submission/load testing

---

## Project Structure

```text
OnlineJudge/
|
+-- database/
|   +-- db.js
|   +-- schema.sql
|   +-- seed.sql
|
+-- frontend/
|   +-- src/
|       +-- components/
|       |   +-- Auth.jsx
|       |   +-- ProblemList.jsx
|       |   +-- ProblemPage.jsx
|       |   +-- SubmissionDetails.jsx
|       |   +-- SubmissionHistory.jsx
|       |
|       +-- api.js
|       +-- App.jsx
|       +-- main.jsx
|
+-- worker/
|   +-- dockerExecutor.js
|   +-- judge.js
|   +-- judgeWorker.js
|
+-- auth/
|   +-- ...
|
+-- server.js
+-- test.http
+-- package.json
+-- README.md
```

---

## Running Locally

### Prerequisites

Make sure the following are installed:

- Node.js
- PostgreSQL
- Docker Desktop
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Madhusudan-Tiwari/OnlineJudge.git
cd OnlineJudge
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file containing the required PostgreSQL connection details and JWT secret.

Example:

```env
DB_USER=your_user
DB_HOST=localhost
DB_NAME=onlinejudge
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_secret
```

### 4. Create the database

Create a PostgreSQL database named:

```text
online_judge
```

Then run the database schema and seed scripts.

### 5. Start the backend

```bash
node server.js
```

The backend starts the judge worker automatically.

### 6. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available through the Vite development server.

---

## Testing the Judge

The project includes HTTP requests for testing the backend API.

Important scenarios to test include:

| Test | Expected Result |
|---|---|
| Correct submission | `ACCEPTED` |
| Incorrect output | `WRONG_ANSWER` |
| Invalid C++ code | `COMPILATION_ERROR` |
| Program crash | `RUNTIME_ERROR` |
| Infinite loop / excessive execution | `TIME_LIMIT_EXCEEDED` |
| Excessive memory allocation | `MEMORY_LIMIT_EXCEEDED` |
| Multiple simultaneous submissions | Correct worker distribution |

---

## Concurrency Testing

The judge was tested with multiple workers processing concurrent submissions.

Example results from local testing:

| Workers | Accepted | Total Time | Throughput |
|---:|---:|---:|---:|
| 1 | 49 / 50 | ~89.4 s | ~0.56 submissions/s |
| 2 | 50 / 50 | ~58.9 s | ~0.85 submissions/s |
| 4 | 50 / 50 | ~58.1 s | ~0.86 submissions/s |

The results showed a substantial improvement when increasing workers from 1 to 2.

Increasing from 2 to 4 workers produced little additional improvement on the development machine, indicating that available local CPU/resources became a limiting factor.

These measurements are specific to the local development environment and are not intended as production performance benchmarks.

---

## Design Decisions

### PostgreSQL as the Queue

PostgreSQL already stores submission state, so using it as the job queue avoids introducing another infrastructure component for the MVP.

`FOR UPDATE SKIP LOCKED` provides a simple mechanism for safely distributing pending submissions between workers.

### Asynchronous Judging

The API remains responsive while potentially expensive compilation and execution happen in background workers.

### Docker for Isolation

Running submitted programs in containers provides resource and environment controls that would not be available when executing user code directly on the server.

### Compile Once, Execute Multiple Tests

The submission is compiled once and the resulting executable is executed against the problem's test cases.

This avoids recompiling the same source code for every test case.

---

## Current Limitations

This is an educational/portfolio implementation rather than a production online judge.

Current limitations include:

- C++ is currently the primary supported language
- Limited problem set
- Local Docker-based execution
- No distributed worker infrastructure
- No advanced sandbox hardening
- No sophisticated plagiarism detection
- No contest/ranking system
- No production-scale deployment

---

## Future Improvements

Possible future improvements include:

- Additional programming languages
- Better sandbox hardening
- Per-problem time and memory limits
- More advanced test-case management
- Leaderboards
- Contests
- Problem tags
- Pagination for submissions
- Better code editor integration
- Worker monitoring
- Cloud deployment
- More extensive load testing

---

## Purpose

The primary goal of this project was not to reproduce every feature of a platform such as LeetCode.

Instead, it was built to understand the engineering problems behind an online judge:

- asynchronous job processing
- database-backed queues
- concurrent workers
- process isolation
- resource limits
- compilation and execution
- result evaluation
- failure recovery
- backend API design
- persistent application state
