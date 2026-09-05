CREATE TABLE problems (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(100) UNIQUE,
    statement TEXT,
    constraints TEXT,
    difficulty VARCHAR(7)
);

CREATE TABLE test_cases (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    problem_id INT REFERENCES problems(id),
    input TEXT,
    expected_output TEXT,
    is_hidden BOOL
);

CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE submission_status AS ENUM (
    'PENDING',
    'COMPILING',
    'RUNNING',
    'ACCEPTED',
    'WRONG_ANSWER',
    'RUNTIME_ERROR',
    'COMPILATION_ERROR',
    'TIME_LIMIT_EXCEEDED',
    'MEMORY_LIMIT_EXCEEDED'
);

CREATE TABLE submissions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    problem_id INT NOT NULL REFERENCES problems(id),
    code TEXT NOT NULL,
    language VARCHAR(100) NOT NULL,
    status submission_status NOT NULL,
    error_details TEXT,
    failed_test_case_id INT REFERENCES test_cases(id),
    execution_time_ms INT,
    memory_used_kb INT,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);