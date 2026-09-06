-- ============================================
-- ONLINE JUDGE SEED DATA
-- ============================================
-- This file is idempotent.
-- It can safely be executed multiple times.
-- ============================================


-- ============================================
-- 1. TWO SUM
-- ============================================

INSERT INTO problems (title, statement, constraints, difficulty)
SELECT
    'Two Sum',
    'Given an array of integers and a target value, find two distinct indices whose corresponding values add up to the target.',
    '2 <= n <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9
Exactly one valid answer exists.',
    'Easy'
WHERE NOT EXISTS (
    SELECT 1
    FROM problems
    WHERE title = 'Two Sum'
);


INSERT INTO test_cases (problem_id, input, expected_output, is_hidden)
SELECT
    p.id,
    tc.input,
    tc.expected_output,
    tc.is_hidden
FROM problems p
CROSS JOIN (
    VALUES
        (
            '4
2 7 11 15
9',
            '0 1',
            FALSE
        ),
        (
            '3
3 2 4
6',
            '1 2',
            FALSE
        ),
        (
            '2
3 3
6',
            '0 1',
            TRUE
        ),
        (
            '5
1 8 12 3 7
10',
            '3 4',
            TRUE
        )
) AS tc(input, expected_output, is_hidden)
WHERE p.title = 'Two Sum'
  AND NOT EXISTS (
      SELECT 1
      FROM test_cases t
      WHERE t.problem_id = p.id
        AND t.input = tc.input
  );


-- ============================================
-- 2. REVERSE STRING
-- ============================================

INSERT INTO problems (title, statement, constraints, difficulty)
SELECT
    'Reverse String',
    'Given a string, print the string in reverse order.',
    '1 <= length of string <= 10^5
The string contains printable ASCII characters.',
    'Easy'
WHERE NOT EXISTS (
    SELECT 1
    FROM problems
    WHERE title = 'Reverse String'
);


INSERT INTO test_cases (problem_id, input, expected_output, is_hidden)
SELECT
    p.id,
    tc.input,
    tc.expected_output,
    tc.is_hidden
FROM problems p
CROSS JOIN (
    VALUES
        (
            'hello',
            'olleh',
            FALSE
        ),
        (
            'world',
            'dlrow',
            FALSE
        ),
        (
            'a',
            'a',
            TRUE
        ),
        (
            'abcdef',
            'fedcba',
            TRUE
        )
) AS tc(input, expected_output, is_hidden)
WHERE p.title = 'Reverse String'
  AND NOT EXISTS (
      SELECT 1
      FROM test_cases t
      WHERE t.problem_id = p.id
        AND t.input = tc.input
  );


-- ============================================
-- 3. VALID PARENTHESES
-- ============================================

INSERT INTO problems (title, statement, constraints, difficulty)
SELECT
    'Valid Parentheses',
    'Given a string containing parentheses, determine whether every opening bracket is closed by the correct corresponding closing bracket.',
    '1 <= length of string <= 10^4
The string contains only (, ), {, }, [, and ].',
    'Easy'
WHERE NOT EXISTS (
    SELECT 1
    FROM problems
    WHERE title = 'Valid Parentheses'
);


INSERT INTO test_cases (problem_id, input, expected_output, is_hidden)
SELECT
    p.id,
    tc.input,
    tc.expected_output,
    tc.is_hidden
FROM problems p
CROSS JOIN (
    VALUES
        (
            '()',
            'true',
            FALSE
        ),
        (
            '()[]{}',
            'true',
            FALSE
        ),
        (
            '(]',
            'false',
            TRUE
        ),
        (
            '([{}])',
            'true',
            TRUE
        ),
        (
            '([)]',
            'false',
            TRUE
        )
) AS tc(input, expected_output, is_hidden)
WHERE p.title = 'Valid Parentheses'
  AND NOT EXISTS (
      SELECT 1
      FROM test_cases t
      WHERE t.problem_id = p.id
        AND t.input = tc.input
  );


-- ============================================
-- 4. MAXIMUM SUBARRAY
-- ============================================

INSERT INTO problems (title, statement, constraints, difficulty)
SELECT
    'Maximum Subarray',
    'Given an integer array, find the contiguous subarray with the largest possible sum and print that maximum sum.',
    '1 <= n <= 10^5
-10^4 <= nums[i] <= 10^4',
    'Medium'
WHERE NOT EXISTS (
    SELECT 1
    FROM problems
    WHERE title = 'Maximum Subarray'
);


INSERT INTO test_cases (problem_id, input, expected_output, is_hidden)
SELECT
    p.id,
    tc.input,
    tc.expected_output,
    tc.is_hidden
FROM problems p
CROSS JOIN (
    VALUES
        (
            '9
-2 1 -3 4 -1 2 1 -5 4',
            '6',
            FALSE
        ),
        (
            '5
1 2 3 4 5',
            '15',
            FALSE
        ),
        (
            '5
-8 -3 -6 -2 -5',
            '-2',
            TRUE
        ),
        (
            '1
7',
            '7',
            TRUE
        ),
        (
            '6
-2 -1 -3 4 -1 2',
            '5',
            TRUE
        )
) AS tc(input, expected_output, is_hidden)
WHERE p.title = 'Maximum Subarray'
  AND NOT EXISTS (
      SELECT 1
      FROM test_cases t
      WHERE t.problem_id = p.id
        AND t.input = tc.input
  );


-- ============================================
-- 5. BINARY SEARCH
-- ============================================

INSERT INTO problems (title, statement, constraints, difficulty)
SELECT
    'Binary Search',
    'Given a sorted array of integers and a target value, find the index of the target. If the target does not exist, print -1.',
    '1 <= n <= 10^5
-10^4 <= nums[i] <= 10^4
The array is sorted in ascending order.',
    'Easy'
WHERE NOT EXISTS (
    SELECT 1
    FROM problems
    WHERE title = 'Binary Search'
);


INSERT INTO test_cases (problem_id, input, expected_output, is_hidden)
SELECT
    p.id,
    tc.input,
    tc.expected_output,
    tc.is_hidden
FROM problems p
CROSS JOIN (
    VALUES
        (
            '6
-1 0 3 5 9 12
9',
            '4',
            FALSE
        ),
        (
            '6
-1 0 3 5 9 12
2',
            '-1',
            FALSE
        ),
        (
            '1
5
5',
            '0',
            TRUE
        ),
        (
            '5
1 2 3 4 5
1',
            '0',
            TRUE
        ),
        (
            '5
1 2 3 4 5
5',
            '4',
            TRUE
        )
) AS tc(input, expected_output, is_hidden)
WHERE p.title = 'Binary Search'
  AND NOT EXISTS (
      SELECT 1
      FROM test_cases t
      WHERE t.problem_id = p.id
        AND t.input = tc.input
  );


-- ============================================
-- VERIFY SEED DATA
-- ============================================

SELECT
    p.id,
    p.title,
    p.difficulty,
    COUNT(t.id) AS test_case_count
FROM problems p
LEFT JOIN test_cases t
    ON t.problem_id = p.id
GROUP BY p.id, p.title, p.difficulty
ORDER BY p.id;