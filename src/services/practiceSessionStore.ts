// Practice Session Store - handles configuration, question generation, and cross-tab session management

export interface AptitudeQuestion {
  id: number;
  category: 'Quantitative Aptitude' | 'Logical Reasoning' | 'Core CS & Data Interpretation';
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface AptitudeSession {
  sessionId: string;
  type: 'aptitude';
  topics: string[];
  questionCount: number;
  difficulty: string;
  timeMinutes: number; // 0 = no time limit
  startedAt: number;
  questions: AptitudeQuestion[];
  userAnswers: Record<number, number>;
  status: 'in_progress' | 'completed';
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  topic: string;
  description: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  starterCode: {
    python: string;
    javascript: string;
    java: string;
  };
}

export interface CodingSession {
  sessionId: string;
  type: 'coding';
  topics: string[];
  questionCount: number;
  difficulty: string;
  timeMinutes: number; // 0 = no time limit
  startedAt: number;
  problems: CodingProblem[];
  currentProblemIndex: number;
  submissions: Array<{ problemId: string; status: string; runtime: string; memory: string; time: string }>;
  status: 'in_progress' | 'completed';
}

export interface SQLSession {
  sessionId: string;
  type: 'sql';
  topics: string[];
  difficulty: string;
  timeMinutes: number;
  startedAt: number;
  problem: {
    title: string;
    prompt: string;
    schema: Array<{ table: string; columns: Array<{ name: string; type: string }> }>;
    expectedOutput: string;
    defaultQuery: string;
  };
  status: 'in_progress' | 'completed';
}

export interface AISession {
  sessionId: string;
  type: 'ai-interview';
  targetRole: string;
  interviewType: string;
  difficulty: string;
  numQuestions: number;
  targetCompany: string;
  focusSkills: string;
  interviewMode?: string;
  startedAt: number;
  status: 'in_progress' | 'completed';
}

// Master Question Bank for Aptitude
const ALL_APTITUDE_QUESTIONS: AptitudeQuestion[] = [
  {
    id: 1,
    category: 'Quantitative Aptitude',
    topic: 'Time, Speed & Distance',
    difficulty: 'Medium',
    question: 'A train 150 meters long is running at a speed of 54 km/hr. How long will it take to cross a platform 210 meters long?',
    options: ['18 seconds', '24 seconds', '20 seconds', '15 seconds'],
    correctAnswer: 1,
    explanation: 'Total distance = 150m + 210m = 360m. Speed = 54 * (5/18) = 15 m/s. Time = Distance / Speed = 360 / 15 = 24 seconds.'
  },
  {
    id: 2,
    category: 'Quantitative Aptitude',
    topic: 'Time & Work',
    difficulty: 'Medium',
    question: 'If 12 men or 18 women can construct a wall in 14 days, then in how many days can 8 men and 16 women construct the same wall?',
    options: ['9 days', '10 days', '12 days', '8 days'],
    correctAnswer: 0,
    explanation: '12 men = 18 women => 1 man = 1.5 women. 8 men + 16 women = 8*(1.5) + 16 = 28 women. Time = (18 * 14) / 28 = 9 days.'
  },
  {
    id: 3,
    category: 'Quantitative Aptitude',
    topic: 'Percentages',
    difficulty: 'Easy',
    question: 'A fruit seller had some apples. He sells 40% apples and still has 420 apples. Originally, how many apples did he have?',
    options: ['588 apples', '600 apples', '672 apples', '700 apples'],
    correctAnswer: 3,
    explanation: 'Remaining apples = 60% = 420. Original total = 420 / 0.60 = 700 apples.'
  },
  {
    id: 4,
    category: 'Quantitative Aptitude',
    topic: 'Profit & Loss',
    difficulty: 'Easy',
    question: 'A shopkeeper purchases an article for $250 and sells it for $300. What is his profit percentage?',
    options: ['15%', '20%', '25%', '30%'],
    correctAnswer: 1,
    explanation: 'Profit = $300 - $250 = $50. Profit % = (50 / 250) * 100 = 20%.'
  },
  {
    id: 5,
    category: 'Quantitative Aptitude',
    topic: 'Probability',
    difficulty: 'Hard',
    question: 'In a lottery of 50 tickets numbered 1 to 50, two tickets are drawn at random. What is the probability that both have prime numbers?',
    options: ['3/35', '7/115', '3/35', '7/115'],
    correctAnswer: 1,
    explanation: 'There are 15 primes between 1 and 50. Total pairs = 50C2 = 1225. Prime pairs = 15C2 = 105. Probability = 105 / 1225 = 3 / 35.'
  },
  {
    id: 6,
    category: 'Logical Reasoning',
    topic: 'Number Series',
    difficulty: 'Easy',
    question: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
    options: ['(1/3)', '(1/8)', '(2/8)', '(1/16)'],
    correctAnswer: 1,
    explanation: 'Geometric sequence where each number is halved. (1/4) / 2 = 1/8.'
  },
  {
    id: 7,
    category: 'Logical Reasoning',
    topic: 'Syllogisms',
    difficulty: 'Medium',
    question: 'Statements: All mangoes are golden. No golden thing is cheap. Conclusions: I. All mangoes are cheap. II. No mango is cheap.',
    options: ['Only conclusion I follows', 'Only conclusion II follows', 'Either I or II follows', 'Neither I nor II follows'],
    correctAnswer: 1,
    explanation: 'Since all mangoes are golden and no golden item is cheap, no mango can be cheap. Conclusion II follows.'
  },
  {
    id: 8,
    category: 'Logical Reasoning',
    topic: 'Coding-Decoding',
    difficulty: 'Easy',
    question: 'In a certain code language, "COMPUTER" is written as "RFUVQNPC". How is "MEDICINE" written in that code?',
    options: ['MFEDJJOE', 'MFEJDJOE', 'EOJDEJFM', 'EOJDJEFM'],
    correctAnswer: 3,
    explanation: 'The first and last letters are swapped, and the intermediate letters are incremented by 1 in reverse order.'
  },
  {
    id: 9,
    category: 'Logical Reasoning',
    topic: 'Blood Relations',
    difficulty: 'Medium',
    question: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
    options: ['Brother', 'Uncle', 'Cousin', 'Father'],
    correctAnswer: 3,
    explanation: 'The only son of Suresh\'s mother is Suresh himself. So the boy is Suresh\'s son, meaning Suresh is his Father.'
  },
  {
    id: 10,
    category: 'Logical Reasoning',
    topic: 'Direction Sense',
    difficulty: 'Medium',
    question: 'A man walks 5 km toward South and then turns right. After walking 3 km he turns left and walks 5 km. In which direction is he from the starting point?',
    options: ['West', 'South', 'North-East', 'South-West'],
    correctAnswer: 3,
    explanation: 'He moves South, then West, then South again. His net displacement is West and South, which is South-West.'
  },
  {
    id: 11,
    category: 'Core CS & Data Interpretation',
    topic: 'Algorithms',
    difficulty: 'Medium',
    question: 'What is the worst-case time complexity of QuickSort when selecting the first element as the pivot?',
    options: ['O(N log N)', 'O(N^2)', 'O(N)', 'O(log N)'],
    correctAnswer: 1,
    explanation: 'If the input is already sorted, picking the first element splits into sizes 0 and N-1, degrading recursion to O(N^2).'
  },
  {
    id: 12,
    category: 'Core CS & Data Interpretation',
    topic: 'Data Structures',
    difficulty: 'Easy',
    question: 'Which data structure uses the Last-In, First-Out (LIFO) order for adding and removing elements?',
    options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
    correctAnswer: 1,
    explanation: 'A Stack strictly operates on a Last-In, First-Out (LIFO) discipline.'
  },
  {
    id: 13,
    category: 'Core CS & Data Interpretation',
    topic: 'DBMS',
    difficulty: 'Medium',
    question: 'Which of the following ACID properties ensures that either all operations of a transaction take place or none do?',
    options: ['Consistency', 'Isolation', 'Atomicity', 'Durability'],
    correctAnswer: 2,
    explanation: 'Atomicity ensures that transaction operations are all-or-nothing.'
  },
  {
    id: 14,
    category: 'Core CS & Data Interpretation',
    topic: 'Operating Systems',
    difficulty: 'Hard',
    question: 'Which condition is NOT one of the four Coffman conditions necessary for a system deadlock to occur?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
    correctAnswer: 2,
    explanation: 'The Coffman condition is "No Preemption" (resources cannot be forcibly confiscated), not "Preemption Allowed".'
  },
  {
    id: 15,
    category: 'Core CS & Data Interpretation',
    topic: 'Computer Networks',
    difficulty: 'Easy',
    question: 'Which transport layer protocol provides reliable, connection-oriented byte stream transmission?',
    options: ['UDP', 'ICMP', 'TCP', 'IP'],
    correctAnswer: 2,
    explanation: 'TCP (Transmission Control Protocol) is connection-oriented and provides reliable byte streams.'
  }
];

// Master Coding Problem Bank
const ALL_CODING_PROBLEMS: CodingProblem[] = [
  {
    id: 'rotated-array',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'Algorithms & Binary Search',
    topic: 'Binary Search',
    description: `Given a rotated sorted integer array \`nums\` and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`. You must write an algorithm with $O(\\log N)$ runtime complexity.`,
    examples: [
      {
        input: 'nums = [4,5,6,7,0,1,2], target = 0',
        output: '4',
        explanation: '0 is located at index 4 in the rotated array.'
      },
      {
        input: 'nums = [4,5,6,7,0,1,2], target = 3',
        output: '-1',
        explanation: '3 is not present in the array.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 5000',
      '-10^4 <= nums[i] <= 10^4',
      'All values of nums are unique.',
      'nums is guaranteed to be rotated at some pivot index.'
    ],
    starterCode: {
      python: `def search_rotated(nums: list[int], target: int) -> int:
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        if nums[low] <= nums[mid]:
            if nums[low] <= target < nums[mid]:
                high = mid - 1
            else:
                low = mid + 1
        else:
            if nums[mid] < target <= nums[high]:
                low = mid + 1
            else:
                high = mid - 1
    return -1`,
      javascript: `function searchRotated(nums, target) {
    let low = 0, high = nums.length - 1;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (nums[mid] === target) return mid;
        if (nums[low] <= nums[mid]) {
            if (nums[low] <= target && target < nums[mid]) high = mid - 1;
            else low = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[high]) low = mid + 1;
            else high = mid - 1;
        }
    }
    return -1;
}`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        int low = 0, high = nums.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return mid;
            if (nums[low] <= nums[mid]) {
                if (nums[low] <= target && target < nums[mid]) high = mid - 1;
                else low = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[high]) low = mid + 1;
                else high = mid - 1;
            }
        }
        return -1;
    }
}`
    }
  },
  {
    id: 'two-sum',
    title: 'Two Sum II - Input Array Is Sorted',
    difficulty: 'Easy',
    category: 'Two Pointers',
    topic: 'Two Pointers',
    description: `Given a 1-indexed array of integers \`numbers\` that is already sorted in non-decreasing order, find two numbers such that they add up to a specific \`target\` number.`,
    examples: [
      {
        input: 'numbers = [2,7,11,15], target = 9',
        output: '[1,2]',
        explanation: 'The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2.'
      }
    ],
    constraints: [
      '2 <= numbers.length <= 3 * 10^4',
      '-1000 <= numbers[i] <= 1000'
    ],
    starterCode: {
      python: `def two_sum(numbers: list[int], target: int) -> list[int]:
    l, r = 0, len(numbers) - 1
    while l < r:
        curr = numbers[l] + numbers[r]
        if curr == target:
            return [l + 1, r + 1]
        elif curr < target:
            l += 1
        else:
            r -= 1
    return []`,
      javascript: `function twoSum(numbers, target) {
    let l = 0, r = numbers.length - 1;
    while (l < r) {
        let sum = numbers[l] + numbers[r];
        if (sum === target) return [l + 1, r + 1];
        if (sum < target) l++;
        else r--;
    }
    return [];
}`,
      java: `class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int l = 0, r = numbers.length - 1;
        while (l < r) {
            int sum = numbers[l] + numbers[r];
            if (sum == target) return new int[]{l + 1, r + 1};
            if (sum < target) l++; else r--;
        }
        return new int[]{};
    }
}`
    }
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Data Structures',
    topic: 'Stack',
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets in the correct order.`,
    examples: [
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only: ()[]{}'
    ],
    starterCode: {
      python: `def is_valid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
      javascript: `function isValid(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (let char of s) {
        if (map[char]) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}`,
      java: `class Solution {
    public boolean isValid(String s) {
        java.util.Stack<Character> stack = new java.util.Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`
    }
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray (Kadane\'s Algorithm)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    topic: 'Dynamic Programming',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.`,
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    starterCode: {
      python: `def max_sub_array(nums: list[int]) -> int:
    current_sum = max_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum`,
      javascript: `function maxSubArray(nums) {
    let currentSum = nums[0];
    let maxSum = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        int currentSum = nums[0];
        int maxSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum;
    }
}`
    }
  }
];

class PracticeSessionStore {
  private STORAGE_KEY = 'careerforge_practice_sessions_v1';

  private getStore(): Record<string, any> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveStore(store: Record<string, any>) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.error("Failed to persist practice session", e);
    }
  }

  // --- APTITUDE SESSION ---
  createAptitudeSession(config: {
    topics: string[];
    questionCount: number;
    difficulty: string;
    timeMinutes: number;
  }): string {
    const sessionId = `apt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Filter matching questions
    let pool = ALL_APTITUDE_QUESTIONS.filter(q => {
      const topicMatch = config.topics.length === 0 || config.topics.includes(q.topic) || config.topics.includes(q.category);
      const diffMatch = config.difficulty === 'Mixed' || q.difficulty === config.difficulty;
      return topicMatch && diffMatch;
    });

    if (pool.length === 0) {
      pool = ALL_APTITUDE_QUESTIONS;
    }

    // Multiply or slice to match target questionCount
    let questions: AptitudeQuestion[] = [];
    while (questions.length < config.questionCount) {
      for (const q of pool) {
        if (questions.length >= config.questionCount) break;
        questions.push({
          ...q,
          id: questions.length + 1
        });
      }
    }

    const session: AptitudeSession = {
      sessionId,
      type: 'aptitude',
      topics: config.topics,
      questionCount: config.questionCount,
      difficulty: config.difficulty,
      timeMinutes: config.timeMinutes,
      startedAt: Date.now(),
      questions,
      userAnswers: {},
      status: 'in_progress'
    };

    const store = this.getStore();
    store[sessionId] = session;
    this.saveStore(store);

    return sessionId;
  }

  getAptitudeSession(sessionId: string): AptitudeSession | null {
    const store = this.getStore();
    return store[sessionId] || null;
  }

  updateAptitudeSession(sessionId: string, updates: Partial<AptitudeSession>) {
    const store = this.getStore();
    if (store[sessionId]) {
      store[sessionId] = { ...store[sessionId], ...updates };
      this.saveStore(store);
    }
  }

  // --- CODING SESSION ---
  createCodingSession(config: {
    topics: string[];
    questionCount: number;
    difficulty: string;
    timeMinutes: number;
  }): string {
    const sessionId = `code-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    let pool = ALL_CODING_PROBLEMS.filter(p => {
      const topicMatch = config.topics.length === 0 || config.topics.includes(p.topic) || config.topics.includes(p.category);
      const diffMatch = config.difficulty === 'Mixed' || p.difficulty === config.difficulty;
      return topicMatch && diffMatch;
    });

    if (pool.length === 0) {
      pool = ALL_CODING_PROBLEMS;
    }

    let problems: CodingProblem[] = [];
    while (problems.length < Math.min(config.questionCount, 10)) {
      for (const p of pool) {
        if (problems.length >= Math.min(config.questionCount, 10)) break;
        problems.push(p);
      }
    }

    const session: CodingSession = {
      sessionId,
      type: 'coding',
      topics: config.topics,
      questionCount: config.questionCount,
      difficulty: config.difficulty,
      timeMinutes: config.timeMinutes,
      startedAt: Date.now(),
      problems,
      currentProblemIndex: 0,
      submissions: [],
      status: 'in_progress'
    };

    const store = this.getStore();
    store[sessionId] = session;
    this.saveStore(store);

    return sessionId;
  }

  getCodingSession(sessionId: string): CodingSession | null {
    const store = this.getStore();
    return store[sessionId] || null;
  }

  updateCodingSession(sessionId: string, updates: Partial<CodingSession>) {
    const store = this.getStore();
    if (store[sessionId]) {
      store[sessionId] = { ...store[sessionId], ...updates };
      this.saveStore(store);
    }
  }

  // --- SQL SESSION ---
  createSQLSession(config: {
    topics: string[];
    difficulty: string;
    timeMinutes: number;
  }): string {
    const sessionId = `sql-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const session: SQLSession = {
      sessionId,
      type: 'sql',
      topics: config.topics,
      difficulty: config.difficulty,
      timeMinutes: config.timeMinutes,
      startedAt: Date.now(),
      problem: {
        title: 'High-Value Customer Spending & Order Aggregation',
        prompt: 'Write an optimized SQL query that returns the top 5 customers along with their total order spend, sorted in descending order of total spend. Join customers with orders and group by customer ID and name.',
        schema: [
          {
            table: 'customers',
            columns: [
              { name: 'customer_id', type: 'INT (PRIMARY KEY)' },
              { name: 'customer_name', type: 'VARCHAR(100)' },
              { name: 'email', type: 'VARCHAR(150)' },
              { name: 'country', type: 'VARCHAR(50)' }
            ]
          },
          {
            table: 'orders',
            columns: [
              { name: 'order_id', type: 'INT (PRIMARY KEY)' },
              { name: 'customer_id', type: 'INT (FOREIGN KEY)' },
              { name: 'order_date', type: 'DATE' },
              { name: 'total_amount', type: 'DECIMAL(10,2)' },
              { name: 'status', type: 'VARCHAR(20)' }
            ]
          }
        ],
        expectedOutput: 'Table of (customer_id, customer_name, total_spent) ordered by total_spent DESC limit 5.',
        defaultQuery: `SELECT 
    c.customer_id,
    c.customer_name,
    SUM(o.total_amount) AS total_spent
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.customer_name
ORDER BY total_spent DESC
LIMIT 5;`
      },
      status: 'in_progress'
    };

    const store = this.getStore();
    store[sessionId] = session;
    this.saveStore(store);

    return sessionId;
  }

  getSQLSession(sessionId: string): SQLSession | null {
    const store = this.getStore();
    return store[sessionId] || null;
  }

  // --- AI INTERVIEW SESSION ---
  createAISession(config: {
    targetRole: string;
    interviewType: string;
    difficulty: string;
    numQuestions: number;
    targetCompany: string;
    focusSkills: string;
    interviewMode?: string;
  }): string {
    const sessionId = `ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const session: AISession = {
      sessionId,
      type: 'ai-interview',
      targetRole: config.targetRole,
      interviewType: config.interviewType,
      difficulty: config.difficulty,
      numQuestions: config.numQuestions,
      targetCompany: config.targetCompany,
      focusSkills: config.focusSkills,
      interviewMode: config.interviewMode || 'live',
      startedAt: Date.now(),
      status: 'in_progress'
    };

    const store = this.getStore();
    store[sessionId] = session;
    this.saveStore(store);

    return sessionId;
  }

  getAISession(sessionId: string): AISession | null {
    const store = this.getStore();
    return store[sessionId] || null;
  }
}

export const practiceSessionStore = new PracticeSessionStore();
