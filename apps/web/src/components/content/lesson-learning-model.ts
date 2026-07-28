import type { Lesson, LessonSummary } from "@/core/content/domain/content";

export type LanguageKey = "en" | "bn" | "hi";

export type PatternKey =
  | "search"
  | "sort"
  | "array"
  | "string"
  | "stack"
  | "queue"
  | "linkedList"
  | "graph"
  | "heap"
  | "tree"
  | "dp"
  | "recursion"
  | "hashing"
  | "complexity"
  | "generic";

export type MiniExample = {
  title: string;
  body: string;
  trace: string;
};

export type LearningModel = {
  pattern: PatternKey;
  topic: string;
  definition: string;
  whyItMatters: string;
  mentalModel: string;
  state: string;
  rule: string;
  invariant: string;
  pitfalls: string[];
  examples: MiniExample[];
};

const hiddenTopicPartSlugs = new Set(["practice", "interview-questions", "revision-summary"]);

export function visibleTopicParts(lessons: LessonSummary[]) {
  return lessons.filter((lesson) => !hiddenTopicPartSlugs.has(lesson.slug));
}

export function isBubbleSortLesson(lesson: Lesson) {
  return lesson.chapter.slug === "sorting" && lesson.lesson.slug === "bubble-sort";
}

export function buildLearningModel(lesson: Lesson): LearningModel {
  if (isBubbleSortLesson(lesson)) {
    return bubbleSortModel;
  }

  const pattern = detectPattern(lesson);
  const topic = displayTopic(lesson);
  const base = models[pattern] ?? models.generic;

  return {
    ...base,
    pattern,
    topic,
    definition: specialize(base.definition, topic),
    whyItMatters: specialize(base.whyItMatters, topic),
    mentalModel: specialize(base.mentalModel, topic),
  };
}

export function translateModel(model: LearningModel, language: LanguageKey) {
  if (model.topic === bubbleSortModel.topic) {
    return bubbleSortCopy[language];
  }

  return buildGenericLessonCopy(model, language);
}
export function buildTeachingCodeExample(lesson: Lesson) {
  if (isBubbleSortLesson(lesson)) {
    return {
      language: "python",
      filename: "sorting-bubble-sort.py",
      code: `def bubble_sort(items):
    # Bubble Sort compares neighbors: left value and right value.
    # We copy the input so the original list stays unchanged.
    values = list(items)
    n = len(values)

    # After each outer pass, the largest unsorted value moves to the end.
    for end in range(n - 1, 0, -1):
        swapped = False

        # Compare every adjacent pair from index 0 up to end - 1.
        for i in range(end):
            left = values[i]
            right = values[i + 1]

            # If the left value is bigger, the pair is in wrong order.
            if left > right:
                values[i], values[i + 1] = right, left
                swapped = True

        # If one full pass made no swap, the list is already sorted.
        if not swapped:
            break

    return values`,
    };
  }

  const model = buildLearningModel(lesson);
  const functionName = `${lesson.chapter.slug}_${lesson.lesson.slug}`.replace(/-/g, "_");
  const code = codeByPattern[model.pattern]?.(functionName) ?? codeByPattern.generic(functionName);

  return {
    language: "python",
    filename: `${lesson.chapter.slug}-${lesson.lesson.slug}.py`,
    code,
  };
}

function detectPattern(lesson: Lesson): PatternKey {
  const text = `${lesson.chapter.slug} ${lesson.chapter.title} ${lesson.lesson.slug} ${lesson.lesson.title}`.toLowerCase();
  if (/\b(search|bound|binary-search)\b/.test(text)) return "search";
  if (text.includes("sort")) return "sort";
  if (/\b(array|arrays|prefix-sum|two-pointer|sliding-window)\b/.test(text)) return "array";
  if (/\b(string|strings|palindrome|pattern-matching|character)\b/.test(text)) return "string";
  if (/\b(stack|push|pop|peek|lifo)\b/.test(text)) return "stack";
  if (/\b(queue|enqueue|dequeue|front|rear|fifo|deque)\b/.test(text)) return "queue";
  if (/\b(linked-list|node-structure|slow-fast|reverse-list)\b/.test(text)) return "linkedList";
  if (/\b(heap|priority-queue|heapify|extract|min-max)\b/.test(text)) return "heap";
  if (/\b(graph|bfs|dfs|dijkstra|bellman|floyd|spanning|connected|topological|cycle-detection)\b/.test(text)) return "graph";
  if (/\b(binary-tree|tree|bst|avl|trie|segment-tree|fenwick)\b/.test(text)) return "tree";
  if (/\b(dynamic-programming|dp|knapsack|memoization|tabulation|lis|lcs)\b/.test(text)) return "dp";
  if (/\b(recursion|backtracking|subset|permutation|queens|sudoku|combination)\b/.test(text)) return "recursion";
  if (/\b(hash|hashing|map|set|collision)\b/.test(text)) return "hashing";
  if (/\b(complexity|big-o|big-theta|big-omega|algorithm-analysis|time|space|asymptotic)\b/.test(text)) return "complexity";
  return "generic";
}

function displayTopic(lesson: Lesson) {
  if (/^(introduction|practice|interview questions|revision summary)$/i.test(lesson.lesson.title.trim())) {
    return lesson.chapter.title;
  }
  return `${lesson.chapter.title}: ${lesson.lesson.title}`;
}

function specialize(text: string, topic: string) {
  return text.replaceAll("{topic}", topic);
}

const bubbleSortModel: LearningModel = {
  pattern: "sort",
  topic: "Sorting: Bubble Sort",
  definition:
    "Bubble Sort is a simple sorting algorithm that repeatedly compares two neighboring values and swaps them when they are in the wrong order. After one full pass, the largest unsorted value has moved to its correct position at the right side.",
  whyItMatters:
    "Bubble Sort is not used for large production datasets because it is slow, but it is excellent for beginners because every decision is visible: compare two values, swap if needed, then repeat. It teaches comparison, swapping, sorted boundary, dry-run discipline, and why nested loops can become expensive.",
  mentalModel:
    "Imagine light bubbles rising through water. In ascending Bubble Sort, larger numbers slowly move right after repeated neighbor swaps. The right side becomes sorted first, one value after each pass.",
  state: "current pair, whether a swap happened, unsorted boundary, sorted right side",
  rule:
    "Look at two adjacent values. If the left value is greater than the right value, swap them. Continue until the largest remaining value reaches the unsorted boundary.",
  invariant:
    "After pass 1, the largest value is fixed at the last position. After pass 2, the two largest values are fixed at the end. The sorted right side must never be touched again.",
  pitfalls: [
    "Comparing values that are not adjacent. Bubble Sort only compares neighbors like index i and i + 1.",
    "Forgetting that the sorted side grows from the right. After each pass, one more ending position is already correct.",
    "Running the inner loop too far and comparing inside the sorted region unnecessarily.",
    "Swapping when values are already in correct order. Swap only when left > right for ascending order.",
    "Ignoring the no-swap optimization. If a full pass makes no swap, the array is already sorted.",
  ],
  examples: [
    {
      title: "One neighbor comparison",
      body:
        "In [5, 1, 4, 2], start with the first pair 5 and 1. Because 5 is bigger than 1, they are in the wrong order for ascending sort, so we swap them.",
      trace: "[5, 1, 4, 2] -> compare 5 and 1 -> swap -> [1, 5, 4, 2]",
    },
    {
      title: "One full pass",
      body:
        "Keep comparing neighbors from left to right. The value 5 swaps with 4, then swaps with 2, so it moves to the last position. That last position is now fixed.",
      trace: "[1, 5, 4, 2] -> [1, 4, 5, 2] -> [1, 4, 2, 5]",
    },
  ],
};

const bubbleSortCopy = {
  en: {
    title: "Bubble Sort: guided example",
    intro:
      "We will sort [5, 1, 4, 2] in ascending order. Read it like a teacher's board: compare one neighboring pair, decide whether the pair is in the correct order, swap only when needed, and watch the largest unsorted value settle on the right after each pass.",
    goalLabel: "Learning goal",
    goal:
      "Understand why Bubble Sort compares adjacent pairs and how every full pass fixes one more value at the end of the array.",
    stateLabel: "Track this state",
    state: bubbleSortModel.state,
    ruleLabel: "Rule",
    rule: bubbleSortModel.rule,
    rememberLabel: "What to remember",
    remember:
      "Bubble Sort is easy to dry-run because each action is local: compare neighbors, maybe swap, then move one step right. The correctness proof is the sorted boundary growing from the right.",
    examples: [
      {
        title: "Example 1: first swap",
        body:
          "Start from the left. The first pair is 5 and 1. For ascending order, the smaller value should come first. Since 5 is greater than 1, this pair is wrong, so swap them. Now 1 moves toward the front and 5 moves one step right.",
        trace: "[5, 1, 4, 2] -> compare 5 and 1 -> swap -> [1, 5, 4, 2]",
      },
      {
        title: "Example 2: largest value reaches the end",
        body:
          "Continue the same rule. Compare 5 and 4, swap. Then compare 5 and 2, swap. The largest value 5 keeps moving right until it reaches the last index. After this pass, 5 is fixed and should not be touched again.",
        trace: "[1, 5, 4, 2] -> [1, 4, 5, 2] -> [1, 4, 2, 5]",
      },
    ],
    steps: [
      {
        title: "Pass 1: move the largest value to the end",
        body:
          "Input is [5, 1, 4, 2]. Compare 5 and 1: swap -> [1, 5, 4, 2]. Compare 5 and 4: swap -> [1, 4, 5, 2]. Compare 5 and 2: swap -> [1, 4, 2, 5]. Now 5 is the largest value and it is at the end, so the last position is sorted.",
        state: "unsorted: [1, 4, 2] | sorted: [5]",
      },
      {
        title: "Pass 2: sort the remaining left part",
        body:
          "Ignore the fixed 5 and work only on [1, 4, 2]. Compare 1 and 4: already correct, no swap. Compare 4 and 2: swap -> [1, 2, 4, 5]. Now 4 is fixed before 5.",
        state: "unsorted: [1, 2] | sorted: [4, 5]",
      },
      {
        title: "Pass 3: confirm the final pair",
        body:
          "Only [1, 2] is left. Compare 1 and 2. They are already in ascending order, so no swap is needed. The array is now [1, 2, 4, 5].",
        state: "unsorted: [] | sorted: [1, 2, 4, 5]",
      },
      {
        title: "Verify the answer",
        body:
          "Check every adjacent pair: 1 <= 2, 2 <= 4, and 4 <= 5. Every pair is in the right order, and each pass fixed the largest remaining value at the right boundary. That proves the final list is sorted.",
        state: "1 <= 2 <= 4 <= 5",
      },
    ],
  },
  bn: {
    title: "Bubble Sort: guided example",
    intro:
      "আমরা [5, 1, 4, 2] ছোট থেকে বড় ক্রমে সাজাব। Bubble Sort-এ একবারে শুধু পাশের দুইটি value দেখা হয়। left value যদি right value-এর থেকে বড় হয়, তাহলে দুটিকে swap করা হয়। এইভাবে বড় value ধীরে ধীরে ডান দিকে যায় এবং প্রতিটি pass শেষে একটি value ঠিক জায়গায় বসে যায়।",
    goalLabel: "Learning goal",
    goal:
      "Bubble Sort কেন adjacent pair compare করে এবং প্রতিটি full pass কীভাবে array-এর শেষে একটি value fix করে, সেটা পরিষ্কারভাবে বোঝা।",
    stateLabel: "যে state track করবে",
    state: "current pair, swap হয়েছে কিনা, unsorted boundary, ডান পাশের sorted part",
    ruleLabel: "Rule",
    rule: "পাশের দুইটি value compare করো। left > right হলে swap করো। তারপর এক step ডান দিকে যাও।",
    rememberLabel: "মনে রাখবে",
    remember:
      "Bubble Sort local decision নেয়: পাশের দুইটি value compare, দরকার হলে swap, তারপর ডান দিকে move। প্রতিটি pass শেষে ডান পাশের sorted region বড় হয়।",
    examples: [
      {
        title: "Example 1: প্রথম swap",
        body:
          "প্রথম pair হলো 5 এবং 1। ascending order-এ ছোট value আগে থাকা উচিত। কিন্তু 5 বড় এবং বামে আছে, তাই pair-টি ভুল order-এ আছে। তাই 5 আর 1 swap হবে। এখন 1 সামনে আসবে এবং 5 এক step ডান দিকে যাবে।",
        trace: "[5, 1, 4, 2] -> 5 ও 1 compare -> swap -> [1, 5, 4, 2]",
      },
      {
        title: "Example 2: বড় value শেষে যায় কেন",
        body:
          "একই rule চালিয়ে যাও। 5 ও 4 compare করলে swap হবে। তারপর 5 ও 2 compare করলে আবার swap হবে। তাই 5 এক step করে ডান দিকে যেতে যেতে last position-এ পৌঁছে যায়। এই pass-এর পর 5 fixed।",
        trace: "[1, 5, 4, 2] -> [1, 4, 5, 2] -> [1, 4, 2, 5]",
      },
    ],
    steps: [
      {
        title: "Pass 1: সবচেয়ে বড় value শেষে পাঠাও",
        body:
          "Input [5, 1, 4, 2]। প্রথমে 5 ও 1 compare: 5 > 1, তাই swap -> [1, 5, 4, 2]। এরপর 5 ও 4 compare: swap -> [1, 4, 5, 2]। এরপর 5 ও 2 compare: swap -> [1, 4, 2, 5]। এখন 5 সবচেয়ে বড় এবং শেষে আছে, তাই শেষ position sorted।",
        state: "unsorted: [1, 4, 2] | sorted: [5]",
      },
      {
        title: "Pass 2: বাকি left part সাজাও",
        body:
          "এখন fixed 5 আর touch করার দরকার নেই। [1, 4, 2] নিয়ে কাজ করো। 1 ও 4 already correct, তাই swap নেই। 4 ও 2 compare করলে swap -> [1, 2, 4, 5]। এখন 4-ও fixed।",
        state: "unsorted: [1, 2] | sorted: [4, 5]",
      },
      {
        title: "Pass 3: শেষ pair confirm করো",
        body:
          "এখন শুধু 1 ও 2 check করতে হবে। 1 ছোট এবং বামে আছে, তাই কোনো swap লাগবে না। Final array হলো [1, 2, 4, 5]।",
        state: "unsorted: [] | sorted: [1, 2, 4, 5]",
      },
      {
        title: "Answer verify করো",
        body:
          "Final array-তে পাশের pair গুলো check করো: 1 <= 2, 2 <= 4, 4 <= 5। সব pair correct order-এ আছে এবং প্রতিটি pass সবচেয়ে বড় remaining value-কে right boundary-তে fix করেছে। তাই output sorted।",
        state: "1 <= 2 <= 4 <= 5",
      },
    ],
  },
  hi: {
    title: "Bubble Sort: guided example",
    intro:
      "हम [5, 1, 4, 2] को ascending order में sort करेंगे। Bubble Sort में हर बार केवल पास-पास वाली दो values compare होती हैं। अगर left value, right value से बड़ी है, तो दोनों को swap किया जाता है। इस तरह बड़ी value धीरे-धीरे right side में जाती है और हर pass के बाद एक value सही जगह fix हो जाती है।",
    goalLabel: "Learning goal",
    goal:
      "यह समझना कि Bubble Sort adjacent pairs क्यों compare करता है और हर full pass array के end में एक value कैसे fix करता है।",
    stateLabel: "Track this state",
    state: "current pair, swap हुआ या नहीं, unsorted boundary, right side sorted part",
    ruleLabel: "Rule",
    rule: "पास-पास की दो values compare करो। left > right हो तो swap करो। फिर एक step right जाओ।",
    rememberLabel: "याद रखो",
    remember:
      "Bubble Sort local decision लेता है: neighbors compare करो, जरूरत हो तो swap करो, फिर right move करो। हर pass के बाद sorted region right side में बढ़ता है।",
    examples: [
      {
        title: "Example 1: first swap",
        body:
          "पहली pair 5 और 1 है। Ascending order में छोटी value पहले आनी चाहिए। 5 बड़ी है और left में है, इसलिए pair wrong order में है और swap होगा। अब 1 front की तरफ आएगा और 5 एक step right जाएगा।",
        trace: "[5, 1, 4, 2] -> compare 5 and 1 -> swap -> [1, 5, 4, 2]",
      },
      {
        title: "Example 2: largest value end तक कैसे जाती है",
        body:
          "Same rule continue करो। 5 और 4 compare करो, swap करो। फिर 5 और 2 compare करो, swap करो। 5 step by step right side में जाकर last position पर fix हो जाता है।",
        trace: "[1, 5, 4, 2] -> [1, 4, 5, 2] -> [1, 4, 2, 5]",
      },
    ],
    steps: [
      {
        title: "Pass 1: largest value को end में भेजो",
        body:
          "Input [5, 1, 4, 2] है। 5 और 1 compare: swap -> [1, 5, 4, 2]। 5 और 4 compare: swap -> [1, 4, 5, 2]। 5 और 2 compare: swap -> [1, 4, 2, 5]। अब 5 last position में fixed है।",
        state: "unsorted: [1, 4, 2] | sorted: [5]",
      },
      {
        title: "Pass 2: remaining left part sort करो",
        body:
          "अब fixed 5 को ignore करो। [1, 4, 2] पर काम करो। 1 और 4 correct हैं, no swap। 4 और 2 wrong order में हैं, swap -> [1, 2, 4, 5]। अब 4 भी fixed है।",
        state: "unsorted: [1, 2] | sorted: [4, 5]",
      },
      {
        title: "Pass 3: final pair confirm करो",
        body:
          "अब 1 और 2 compare करो। 1 already छोटा है, इसलिए no swap. Final array [1, 2, 4, 5] है।",
        state: "unsorted: [] | sorted: [1, 2, 4, 5]",
      },
      {
        title: "Answer verify करो",
        body:
          "हर adjacent pair check करो: 1 <= 2, 2 <= 4, 4 <= 5। सभी pairs सही order में हैं और हर pass ने largest remaining value को right boundary पर fix किया है। इसलिए output sorted है।",
        state: "1 <= 2 <= 4 <= 5",
      },
    ],
  },
};

function buildGenericLessonCopy(model: LearningModel, language: LanguageKey) {
  if (language === "bn") {
    return {
      title: `${model.topic}: guided example`,
      intro:
        "এই example-টি beginner-friendly ভাবে সাজানো। আগে problem কী চায় সেটা বোঝো, তারপর input থেকে state কীভাবে বদলায় সেটা দেখো, একই rule বারবার apply করো, এবং শেষে answer কেন correct সেটা verify করো।",
      goalLabel: "Learning goal",
      goal: `${model.topic} মুখস্থ করা নয়; input দেখলে কোন state বদলাচ্ছে, কোন rule apply হচ্ছে, এবং final output কেন ঠিক হচ্ছে সেটা বোঝাই মূল লক্ষ্য।`,
      stateLabel: "যে state track করবে",
      state: model.state,
      ruleLabel: "Rule",
      rule: model.rule,
      rememberLabel: "মনে রাখবে",
      remember: model.invariant,
      examples: model.examples.map((example, index) => ({
        title: `Example ${index + 1}: ${example.title}`,
        body: `${example.body} Trace পড়ার সময় শুধু final answer দেখবে না। প্রতিটি step-এ কোন value, node, pointer, range, বা subproblem process হচ্ছে এবং rule apply করার পরে state কীভাবে বদলাচ্ছে সেটা বুঝে নাও।`,
        trace: example.trace,
      })),
      steps: [
        {
          title: "Problem statement নিজের ভাষায় বোঝো",
          body:
            "Code লেখার আগে এক লাইনে বলো problem কী চাইছে। Input কী, output কী, এবং কোন condition মানতে হবে সেটা clear না হলে dry-run ও code দুটোই confusing হবে।",
          state: "input + output + rule",
        },
        {
          title: "ছোট input নিয়ে হাতে dry-run করো",
          body: `একটি ছোট example নাও এবং প্রতিটি step লিখে রাখো। এই lesson-এ মূল state হলো: ${model.state}. State লিখলে previous step থেকে next step কীভাবে তৈরি হলো সেটা পরিষ্কার দেখা যায়।`,
          state: model.examples[0]?.trace ?? model.state,
        },
        {
          title: "একই rule বারবার apply করো",
          body:
            "Algorithm consistency দিয়ে কাজ করে। মাঝপথে rule বদলালে answer কখনো কখনো মিলে গেলেও concept দুর্বল থাকে। প্রতিটি value, node, বা decision point-এর জন্য একই rule follow করো।",
          state: model.rule,
        },
        {
          title: "Final output verify করো",
          body:
            "শুধু normal input না, empty input, one item, duplicate value, boundary case, এবং already solved input দিয়েও check করো। এতে solution সত্যিই reliable কিনা বোঝা যায়।",
          state: "normal case + edge cases",
        },
      ],
    };
  }

  if (language === "hi") {
    return {
      title: `${model.topic}: guided example`,
      intro:
        "यह example beginner-friendly तरीके से बनाया गया है। पहले समझो problem क्या मांग रही है, फिर input से state कैसे बदलती है वह देखो, same rule बार-बार apply करो, और अंत में verify करो कि answer सही क्यों है।",
      goalLabel: "Learning goal",
      goal: `${model.topic} को memorize करना लक्ष्य नहीं है; लक्ष्य यह समझना है कि input देखकर कौनसी state बदलती है, कौनसा rule apply होता है, और final output सही क्यों होता है।`,
      stateLabel: "Track this state",
      state: model.state,
      ruleLabel: "Rule",
      rule: model.rule,
      rememberLabel: "याद रखो",
      remember: model.invariant,
      examples: model.examples.map((example, index) => ({
        title: `Example ${index + 1}: ${example.title}`,
        body: `${example.body} Trace पढ़ते समय सिर्फ final answer मत देखो। हर step में कौनसी value, node, pointer, range, या subproblem process हो रही है और rule apply करने के बाद state कैसे बदल रही है, यह समझो।`,
        trace: example.trace,
      })),
      steps: [
        {
          title: "Problem को अपनी भाषा में समझो",
          body:
            "Code लिखने से पहले एक line में बताओ problem क्या मांगती है। Input, output, और condition clear नहीं होंगे तो dry-run और code दोनों confusing होंगे।",
          state: "input + output + rule",
        },
        {
          title: "Small input पर dry-run करो",
          body: `एक छोटा example लो और हर step लिखो। इस lesson की मुख्य state है: ${model.state}. State लिखने से previous step से next step साफ दिखता है।`,
          state: model.examples[0]?.trace ?? model.state,
        },
        {
          title: "Same rule बार-बार apply करो",
          body:
            "Algorithm consistency से काम करता है। बीच में rule बदलने से concept weak रहेगा। हर value, node, या decision point पर वही decision rule follow करो।",
          state: model.rule,
        },
        {
          title: "Final output verify करो",
          body:
            "सिर्फ normal input नहीं, empty input, one item, duplicate value, boundary case, और already solved input से भी check करो। इससे solution reliable है या नहीं साफ होता है।",
          state: "normal case + edge cases",
        },
      ],
    };
  }

  return {
    title: `${model.topic}: guided example`,
    intro:
      "This guided example is written like a teacher's board explanation. First understand what the problem asks, then track the changing state, apply the same rule repeatedly, and finally prove why the output is correct.",
    goalLabel: "Learning goal",
    goal: `Do not memorize ${model.topic}. Learn how the input changes the state, which rule is applied, and why the final output follows from that rule.`,
    stateLabel: "Track this state",
    state: model.state,
    ruleLabel: "Rule",
    rule: model.rule,
    rememberLabel: "What to remember",
    remember: model.invariant,
    examples: model.examples.map((example, index) => ({
      title: `Example ${index + 1}: ${example.title}`,
      body: `${example.body} While reading the trace, do not look only at the final answer. Explain which value, node, pointer, range, or subproblem is being processed and how the state changes after the rule is applied.`,
      trace: example.trace,
    })),
    steps: [
      {
        title: "Understand the problem in your own words",
        body:
          "Before writing code, say what the problem wants in one sentence. Identify the input, the output, and the condition that must stay true. If this is unclear, the dry-run and the code will both feel confusing.",
        state: "input + output + rule",
      },
      {
        title: "Dry-run a small input by hand",
        body: `Use a small example and write every step. In this lesson, the main state is: ${model.state}. Writing the state makes the transition from the previous step to the next step visible.`,
        state: model.examples[0]?.trace ?? model.state,
      },
      {
        title: "Apply the same rule repeatedly",
        body:
          "Algorithms work because the same decision rule is applied consistently. Do not change the rule in the middle of the trace. Apply it to every value, node, or decision point.",
        state: model.rule,
      },
      {
        title: "Verify the final output",
        body:
          "Check the normal case, empty input, one item, repeated values, boundary cases, and already solved input. Passing these cases makes the solution more reliable.",
        state: "normal case + edge cases",
      },
    ],
  };
}
const models: Record<PatternKey, Omit<LearningModel, "pattern" | "topic">> = {
  sort: {
    definition: "{topic} means arranging values in a required order, usually ascending or descending.",
    whyItMatters: "Sorting makes data easier to search, compare, group, and process with two pointers or binary search.",
    mentalModel: "Keep one part sorted, inspect the unsorted part, move the correct value, and grow the sorted region.",
    state: "sorted region, unsorted region, current comparison",
    rule: "Compare values, put the smaller or larger value in the correct place, then continue with the remaining unsorted values.",
    invariant: "At every step, clearly know which part is already sorted.",
    pitfalls: ["Forgetting whether the sort is ascending or descending.", "Moving a value but not updating the sorted boundary.", "Claiming O(n log n) for elementary O(n^2) sorts."],
    examples: [
      { title: "Selection idea", body: "In [5, 2, 4, 1], the smallest value is 1. Place it first, then the first position is fixed.", trace: "[5,2,4,1] -> smallest 1 -> [1,2,4,5]" },
      { title: "Merge idea", body: "Merge [1, 5] and [2, 4] by repeatedly taking the smaller front value.", trace: "[1,5] + [2,4] -> 1 -> 2 -> 4 -> 5" },
    ],
  },
  search: {
    definition: "{topic} means finding a target value or proving that the target is not present.",
    whyItMatters: "Search is the base of lookup, filtering, validation, and many optimized interview problems.",
    mentalModel: "Maintain the set of possible candidate positions and remove only positions proven impossible.",
    state: "candidate range, current value, target",
    rule: "Compare the current value with the target. If the data is sorted, discard only the impossible side.",
    invariant: "Every skipped position must be proven impossible.",
    pitfalls: ["Using binary search on unsorted data.", "Wrong left/right boundary update.", "Returning a guessed index without proving the match."],
    examples: [
      { title: "Linear search", body: "For [4, 2, 7, 9] and target 7, check each value from left to right until 7 is found.", trace: "4 no -> 2 no -> 7 found" },
      { title: "Binary search", body: "For sorted [1, 3, 5, 8, 12] and target 8, middle is 5. Since 8 is larger, search the right half.", trace: "mid 5 -> right half -> 8 found" },
    ],
  },
  stack: {
    definition: "{topic} uses LIFO order: the last inserted value is the first one removed.",
    whyItMatters: "Stacks model undo, recursion calls, expression parsing, browser history, and monotonic patterns.",
    mentalModel: "Push values onto the top. Pop removes only the current top.",
    state: "stack order and top value",
    rule: "Push adds to top; pop removes from top.",
    invariant: "The top is always the next value that will leave.",
    pitfalls: ["Removing from the bottom by mistake.", "Forgetting to check empty stack.", "Confusing stack order with queue order."],
    examples: [
      { title: "Push then pop", body: "Push [3, 1, 4, 1, 5] in order. The last pushed value 5 becomes the top, so pop order is reversed.", trace: "push 3,1,4,1,5 -> pop 5,1,4,1,3" },
      { title: "Empty check", body: "Before peek or pop, verify that the stack has at least one value.", trace: "[] -> pop blocked -> safe result" },
    ],
  },
  queue: {
    definition: "{topic} uses FIFO order: the first inserted value is the first one removed.",
    whyItMatters: "Queues model waiting lines, BFS, scheduling, buffering, and level-by-level processing.",
    mentalModel: "Insert at rear and remove from front.",
    state: "front, rear, queue order",
    rule: "Enqueue at rear; dequeue from front.",
    invariant: "The front is always the next value that will leave.",
    pitfalls: ["Removing from rear by mistake.", "Not handling empty queue.", "Mixing up front and rear pointers."],
    examples: [
      { title: "Arrival order", body: "Enqueue [3, 1, 4]. Since 3 arrived first, it stays at front and leaves first.", trace: "enqueue 3,1,4 -> dequeue 3,1,4" },
      { title: "BFS queue", body: "In BFS, nodes discovered earlier are processed before later nodes.", trace: "A -> enqueue B,C -> process B -> process C" },
    ],
  },
  array: {
    definition: "{topic} stores values in indexed positions, so each value can be read by its index.",
    whyItMatters: "Arrays are the foundation for scanning, two pointers, prefix sums, sorting, and dynamic programming tables.",
    mentalModel: "Move index by index and keep only the state needed for the next decision.",
    state: "index, current value, running answer",
    rule: "Read current index, update the running answer, then move to the next index.",
    invariant: "After processing index i, the running answer represents all values from 0 to i.",
    pitfalls: ["Confusing index with value.", "Off-by-one loop boundaries.", "Forgetting empty array behavior."],
    examples: [
      { title: "Maximum scan", body: "For [3, 1, 4, 1, 5], max starts at 3, stays 3 after 1, becomes 4, stays 4, then becomes 5.", trace: "max: 3 -> 3 -> 4 -> 4 -> 5" },
      { title: "Prefix sum", body: "For [2, 4, 1], running total becomes 2, then 6, then 7.", trace: "2 -> 6 -> 7" },
    ],
  },
  string: {
    definition: "{topic} processes characters in a fixed order using indexes, pointers, or frequency counts.",
    whyItMatters: "String patterns appear in validation, matching, sliding windows, hashing, and interview parsing tasks.",
    mentalModel: "Treat each character like an indexed value and track pointer or count changes.",
    state: "character index, pointer, frequency map",
    rule: "Read or compare a character, then update pointer, window, or frequency.",
    invariant: "Pointer meaning must stay clear after every movement.",
    pitfalls: ["Comparing wrong characters.", "Moving a pointer too early.", "Ignoring case or empty string behavior."],
    examples: [
      { title: "Palindrome", body: "For racecar, compare r with r, a with a, c with c. Every pair matches.", trace: "r=r -> a=a -> c=c -> true" },
      { title: "Frequency", body: "For banana, count b once, a three times, and n twice.", trace: "banana -> b:1, a:3, n:2" },
    ],
  },
  linkedList: {
    definition: "{topic} stores values in nodes connected by links instead of continuous indexes.",
    whyItMatters: "Linked lists teach pointer movement, insertion, deletion, reversal, and cycle detection.",
    mentalModel: "Follow next pointers from head; when changing structure, update links in a safe order.",
    state: "current node, previous node, next link",
    rule: "Save the next link before changing any pointer.",
    invariant: "No node should become unreachable unless it is intentionally removed.",
    pitfalls: ["Losing the rest of the list.", "Not handling head changes.", "Forgetting null checks."],
    examples: [
      { title: "Traversal", body: "Start at head, read one node, then follow next until null.", trace: "head -> 3 -> 1 -> 4 -> null" },
      { title: "Insert after node", body: "To insert 9 after 3, first connect 9 to 1, then connect 3 to 9.", trace: "3 -> 1 becomes 3 -> 9 -> 1" },
    ],
  },
  graph: {
    definition: "{topic} represents objects as nodes and relationships as edges.",
    whyItMatters: "Graphs model networks, maps, dependencies, social links, prerequisites, and shortest paths.",
    mentalModel: "Track visited nodes and a frontier of nodes to process next.",
    state: "visited set, frontier, parent or distance",
    rule: "Visit a node, add safe unvisited neighbors, and update parent or distance.",
    invariant: "A node should not be processed repeatedly without a reason.",
    pitfalls: ["Forgetting visited set.", "Mixing BFS and DFS order.", "Ignoring disconnected components."],
    examples: [
      { title: "BFS", body: "Start at A. Visit B and C first because they are one edge away, then visit deeper nodes.", trace: "A -> B,C -> D,E" },
      { title: "DFS", body: "Go deep on one path, then backtrack when no new neighbor is available.", trace: "A -> B -> D -> backtrack -> C" },
    ],
  },
  heap: {
    definition: "{topic} keeps the highest or lowest priority value at the root.",
    whyItMatters: "Heaps power priority queues, scheduling, top-k problems, and efficient repeated min/max extraction.",
    mentalModel: "Maintain complete tree shape and restore priority order with bubble-up or heapify-down.",
    state: "root, parent, child, heap property",
    rule: "After insert or remove, swap along one path until the heap property is restored.",
    invariant: "The root always contains the current best-priority value.",
    pitfalls: ["Preserving priority but breaking shape.", "Wrong parent/child index formula.", "Stopping heapify too early."],
    examples: [
      { title: "Insert", body: "Insert 2 at the next open slot, then bubble it upward while it is smaller than its parent.", trace: "[3,5,7]+2 -> bubble up -> root 2" },
      { title: "Extract", body: "Remove root, move last value to root, then heapify down.", trace: "remove root -> move last -> heapify down" },
    ],
  },
  tree: {
    definition: "{topic} organizes values in parent-child relationships starting from one root.",
    whyItMatters: "Trees power recursion, hierarchical data, search trees, heaps, tries, and many divide-and-conquer problems.",
    mentalModel: "Solve the current node using answers from left/right child or child list.",
    state: "current node, child result, parent result",
    rule: "Process children in the chosen order and combine their answers at the parent.",
    invariant: "Know exactly what one node returns to its parent.",
    pitfalls: ["Wrong traversal order.", "Missing null/base case.", "Combining child answers incorrectly."],
    examples: [
      { title: "Height", body: "A node height is one plus the larger child height.", trace: "height = 1 + max(left, right)" },
      { title: "Traversal", body: "Inorder means left first, then node, then right.", trace: "left -> root -> right" },
    ],
  },
  dp: {
    definition: "{topic} solves repeated subproblems once and reuses their answers.",
    whyItMatters: "Dynamic programming turns exponential repeated work into controlled table or memo solutions.",
    mentalModel: "Define what one state means, set base cases, then build larger answers from smaller answers.",
    state: "dp state, base case, transition",
    rule: "Compute each state from already known smaller states.",
    invariant: "Every dp value must have one clear meaning.",
    pitfalls: ["Unclear state meaning.", "Wrong base case.", "Using a future state before it is computed."],
    examples: [
      { title: "Fibonacci", body: "Each value uses the previous two stored values instead of recomputing them.", trace: "0,1 -> 1 -> 2 -> 3 -> 5" },
      { title: "Choose or skip", body: "At an index, compare taking current value with skipping it.", trace: "best = max(take, skip)" },
    ],
  },
  recursion: {
    definition: "{topic} solves a problem by calling the same logic on a smaller version.",
    whyItMatters: "Recursion explains call stacks, trees, backtracking, divide-and-conquer, and many DFS patterns.",
    mentalModel: "Stop at a base case; otherwise make the problem smaller and trust the smaller answer.",
    state: "current call, base case, returned value",
    rule: "If base case is reached, return. Otherwise call the smaller problem and combine.",
    invariant: "Every recursive call must move closer to a base case.",
    pitfalls: ["Missing base case.", "Not reducing input size.", "Forgetting to undo choices in backtracking."],
    examples: [
      { title: "Factorial", body: "fact(4) waits for fact(3), until fact(1) returns 1.", trace: "fact(4)=4*fact(3), fact(1)=1" },
      { title: "Subsets", body: "For each value, branch into include and exclude.", trace: "[1,2] -> [], [1], [2], [1,2]" },
    ],
  },
  hashing: {
    definition: "{topic} stores values in a set or map so lookup is fast.",
    whyItMatters: "Hashing simplifies duplicates, frequency counting, two-sum, grouping, and memo lookup.",
    mentalModel: "Before processing a value, ask what is already stored about it.",
    state: "set or map contents",
    rule: "Check stored information first, then update the set or map.",
    invariant: "The table must represent exactly what has already been processed.",
    pitfalls: ["Updating before checking when first occurrence matters.", "Confusing key and value.", "Ignoring collision concept in theory."],
    examples: [
      { title: "Duplicate", body: "For [4, 2, 7, 2], the second 2 is already in the seen set.", trace: "seen 4,2,7 -> second 2 found" },
      { title: "Frequency", body: "For a,b,a,c, increment the count each time a value appears.", trace: "a,b,a,c -> a:2, b:1, c:1" },
    ],
  },
  complexity: {
    definition: "{topic} explains how running time or memory grows when input size grows.",
    whyItMatters: "Complexity helps choose solutions that survive real constraints and interview limits.",
    mentalModel: "Count the dominant operation and keep the largest growth term.",
    state: "input size n, operation count, memory count",
    rule: "Find the operation that grows fastest and express it with asymptotic notation.",
    invariant: "Complexity describes growth, not exact seconds.",
    pitfalls: ["Counting print/debug work.", "Keeping constants as the main answer.", "Ignoring nested loops or recursion depth."],
    examples: [
      { title: "Single loop", body: "Checking n items once grows linearly.", trace: "n checks -> O(n)" },
      { title: "Nested loop", body: "For every item, checking every other item grows quadratically.", trace: "n * n checks -> O(n^2)" },
    ],
  },
  generic: {
    definition: "{topic} is a reusable DSA idea with a rule, state, and verification step.",
    whyItMatters: "A clear mental model makes implementation, debugging, and interview explanation easier.",
    mentalModel: "Read input, track state, apply the rule, and verify the result.",
    state: "current state and next decision",
    rule: "Apply the rule, update state, and repeat until done.",
    invariant: "Explain what changed after every step.",
    pitfalls: ["Skipping dry-run.", "Not naming state.", "Testing only one normal case."],
    examples: [
      { title: "Small input", body: "Use a tiny input so each state change is visible.", trace: "[3,1,4] -> step 1 -> step 2" },
      { title: "State update", body: "Track only what affects the next decision.", trace: "state -> rule -> new state" },
    ],
  },
};

const codeByPattern: Record<PatternKey, (name: string) => string> = {
  sort: (name) => `def ${name}(items):
    # Copy the input so the original list is not changed by surprise.
    values = list(items)

    # Selection-sort idea: after each pass, position i is fixed.
    for i in range(len(values)):
        min_index = i
        for j in range(i + 1, len(values)):
            if values[j] < values[min_index]:
                min_index = j
        values[i], values[min_index] = values[min_index], values[i]

    return values`,
  search: (name) => `def ${name}(items, target):
    # Check each value from left to right.
    for index, value in enumerate(items):
        if value == target:
            return index

    # Target was never found.
    return -1`,
  stack: (name) => `def ${name}(items):
    stack = []

    for value in items:
        stack.append(value)  # push: new value becomes top

    popped = []
    while stack:
        popped.append(stack.pop())  # pop: remove current top

    return popped`,
  queue: (name) => `from collections import deque

def ${name}(items):
    queue = deque()

    for value in items:
        queue.append(value)  # enqueue at rear

    order = []
    while queue:
        order.append(queue.popleft())  # dequeue from front

    return order`,
  array: (name) => `def ${name}(items):
    best = None

    for index, value in enumerate(items):
        # State after this line: value at index is being processed.
        if best is None or value > best:
            best = value

    return best`,
  string: (name) => `def ${name}(text):
    left, right = 0, len(text) - 1

    while left < right:
        if text[left] != text[right]:
            return False
        left += 1
        right -= 1

    return True`,
  linkedList: (name) => `def ${name}(head):
    current = head
    values = []

    while current is not None:
        values.append(current.value)
        current = current.next  # follow the next link

    return values`,
  graph: (name) => `from collections import deque

def ${name}(graph, start):
    visited = {start}
    queue = deque([start])
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

    return order`,
  heap: (name) => `import heapq

def ${name}(items):
    heap = []

    for value in items:
        heapq.heappush(heap, value)

    ordered = []
    while heap:
        ordered.append(heapq.heappop(heap))

    return ordered`,
  tree: (name) => `def ${name}(node):
    if node is None:
        return 0

    left_height = ${name}(node.left)
    right_height = ${name}(node.right)
    return 1 + max(left_height, right_height)`,
  dp: (name) => `def ${name}(nums):
    if not nums:
        return 0

    prev2 = 0
    prev1 = 0
    for value in nums:
        take = prev2 + value
        skip = prev1
        prev2, prev1 = prev1, max(take, skip)

    return prev1`,
  recursion: (name) => `def ${name}(n):
    # Base case: the smallest answer we know directly.
    if n <= 1:
        return 1

    # Recursive case: solve a smaller problem first.
    return n * ${name}(n - 1)`,
  hashing: (name) => `def ${name}(items):
    seen = set()

    for value in items:
        if value in seen:
            return value
        seen.add(value)

    return None`,
  complexity: (name) => `def ${name}(operations):
    total = 0
    max_step = 0

    for cost in operations:
        total += cost
        max_step = max(max_step, cost)

    average = total // len(operations) if operations else 0
    return {"total": total, "maxStep": max_step, "average": average}`,
  generic: (name) => `def ${name}(items):
    state = []

    for value in items:
        # Read input, update state, then verify the state.
        state.append(value)

    return state`,
};
