// Full-Coverage Verification Suite for ALL FriendAI Services
import assert from 'node:assert';

const BASE_URL = process.env.TEST_URL || 'http://127.0.0.1:5002';

const runVerification = async () => {
  console.log('\n======================================================================');
  console.log('🔍 FULL-SPECTRUM AUDIT: FRIEND AI ALL SERVICES END-TO-END VERIFICATION');
  console.log('======================================================================\n');
  
  let passed = 0;
  let failed = 0;

  const test = async (serviceName, testName, fn) => {
    try {
      await fn();
      console.log(`  ✅ [${serviceName}] ${testName}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [${serviceName}] ${testName}:`, err.message);
      failed++;
    }
  };

  const request = async (method, path, body = null, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => '');
    return { status: res.status, data };
  };

  let token1 = null;
  let token2 = null;
  let user1Id = null;
  const email1 = `test_user_${Date.now()}@friendai.com`;
  const email2 = `iso_user_${Date.now()}@friendai.com`;

  // 1. Health Service
  await test('System', 'Health endpoint reports active operational status', async () => {
    const res = await request('GET', '/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'OK');
    assert.ok(res.data.storageMode, 'Storage mode must be reported');
  });

  // 2. Auth Service
  await test('Auth', 'User registration generates valid JWT token and profile', async () => {
    const res = await request('POST', '/api/auth/register', {
      name: 'Maya Lin',
      email: email1,
      password: 'password123'
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.data.token);
    assert.strictEqual(res.data.user.name, 'Maya Lin');
    token1 = res.data.token;
    user1Id = res.data.user.id;
  });

  await test('Auth', 'Secondary user registration for data isolation check', async () => {
    const res = await request('POST', '/api/auth/register', {
      name: 'David Chen',
      email: email2,
      password: 'password456'
    });
    assert.strictEqual(res.status, 201);
    token2 = res.data.token;
  });

  await test('Auth', 'User login with valid credentials returns session token', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: email1,
      password: 'password123'
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token);
  });

  await test('Auth', 'User login with invalid password returns 401 Unauthorized', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: email1,
      password: 'wrongPassword'
    });
    assert.strictEqual(res.status, 401);
  });

  await test('Auth', '/api/auth/me returns authenticated user details', async () => {
    const res = await request('GET', '/api/auth/me', null, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.email, email1);
  });

  await test('Auth', 'Instant Demo Login returns seeded demo session', async () => {
    const res = await request('POST', '/api/auth/demo');
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token);
    assert.strictEqual(res.data.user.email, 'demo@friendai.com');
  });

  // 3. User Profile Service
  await test('Profile', 'Fetch user profile', async () => {
    const res = await request('GET', '/api/users/profile', null, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.name, 'Maya Lin');
  });

  await test('Profile', 'Update user wellness profile', async () => {
    const res = await request('PUT', '/api/users/profile', {
      name: 'Maya Lin (Updated)',
      profile: {
        interests: ['pottery', 'meditation', 'reading'],
        fitness_level: 'moderate',
        sleep_schedule: { bedtime: '23:00', wake_time: '07:00', typical_hours: 8 }
      }
    }, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.name, 'Maya Lin (Updated)');
    assert.deepStrictEqual(res.data.profile.interests, ['pottery', 'meditation', 'reading']);
  });

  // 4. Daily Wellness Check-In Service
  await test('Wellness', 'Submit comprehensive daily check-in', async () => {
    const res = await request('POST', '/api/wellness/check-in', {
      mood: 9,
      energy: 8,
      stress: 3,
      sleep_hours: 7.5,
      sleep_quality: 'restful',
      physical_activity: 'walk',
      social_interaction: 'moderate',
      screen_time_hours: 3.5,
      productivity: 8,
      notes: 'Terrific focus and great morning coffee'
    }, token1);
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.checkIn.mood, 9);
  });

  await test('Wellness', 'Retrieve today check-in completion status', async () => {
    const res = await request('GET', '/api/wellness/check-in/today', null, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.completed, true);
    assert.strictEqual(res.data.checkIn.mood, 9);
  });

  await test('Wellness', 'Retrieve multi-day wellness history', async () => {
    const res = await request('GET', '/api/wellness/history?days=7', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    assert.ok(res.data.length >= 1);
  });

  await test('Wellness', 'Record digital screen time metrics', async () => {
    const res = await request('POST', '/api/wellness/digital', {
      total_hours: 4.5,
      productive_hours: 3.5
    }, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.total_hours, 4.5);
  });

  // 5. Mood Analytics Service
  await test('Analytics', 'Retrieve weekly multi-metric analytics and correlation insights', async () => {
    const res = await request('GET', '/api/mood/analytics?period=weekly', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.timeline));
    assert.strictEqual(res.data.timeline.length, 7);
    assert.ok(res.data.stats);
    assert.ok(Array.isArray(res.data.patterns));
  });

  // 6. Tasks Service
  let taskId1 = null;
  let taskId2 = null;

  await test('Tasks', 'Create task 1 with priority and category', async () => {
    const res = await request('POST', '/api/tasks', {
      title: 'Complete architecture draft',
      priority: 'high',
      category: 'work'
    }, token1);
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.title, 'Complete architecture draft');
    taskId1 = res.data._id || res.data.id;
  });

  await test('Tasks', 'Create task 2 for User 1', async () => {
    const res = await request('POST', '/api/tasks', {
      title: 'Buy art supplies',
      priority: 'medium',
      category: 'personal'
    }, token1);
    assert.strictEqual(res.status, 201);
    taskId2 = res.data._id || res.data.id;
  });

  await test('Tasks', 'Data isolation: User 2 sees 0 tasks', async () => {
    const res = await request('GET', '/api/tasks', null, token2);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.length, 0);
  });

  await test('Tasks', 'Update task completion status', async () => {
    const res = await request('PUT', `/api/tasks/${taskId1}`, { completed: true }, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.completed, true);
  });

  await test('Tasks', 'Delete task 2 cleanly', async () => {
    const res = await request('DELETE', `/api/tasks/${taskId2}`, null, token1);
    assert.strictEqual(res.status, 200);
  });

  // 7. Goals Service (Creation, AI Breakdown, Edit & Update, Delete)
  let goalId = null;

  await test('Goals', 'Create goal with initial milestones', async () => {
    const res = await request('POST', '/api/goals', {
      title: 'Run a 10K marathon',
      category: 'fitness',
      milestones: [
        { title: 'Buy proper running shoes', completed: true },
        { title: 'Run 5K without breaks', completed: false }
      ]
    }, token1);
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.progress, 50);
    goalId = res.data._id || res.data.id;
  });

  await test('Goals', 'Update goal (Edit Goal capability)', async () => {
    const res = await request('PUT', `/api/goals/${goalId}`, {
      title: 'Run a Half-Marathon (21K)',
      description: 'Progressing towards longer endurance',
      category: 'fitness',
      milestones: [
        { title: 'Buy proper running shoes', completed: true },
        { title: 'Run 5K without breaks', completed: true },
        { title: 'Run 10K comfortably', completed: false }
      ]
    }, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.title, 'Run a Half-Marathon (21K)');
    assert.strictEqual(res.data.progress, 67, 'Progress auto-calculated to 67%');
  });

  await test('Goals', 'AI Goal Breakdown generates milestones and starter tasks', async () => {
    const res = await request('POST', '/api/ai/breakdown-goal', {
      title: 'Learn Italian',
      category: 'learning'
    }, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.milestones));
    assert.ok(res.data.milestones.length >= 3);
    assert.ok(Array.isArray(res.data.tasks || res.data.suggestedTasks));
  });

  // 8. Habits Service (Multi-Habit Creation, Specific ID Completion, Duplicate Rejection, Undo)
  let habit1Id = null;
  let habit2Id = null;

  await test('Habits', 'Create Habit 1 (Morning Meditation)', async () => {
    const res = await request('POST', '/api/habits', {
      name: 'Morning Meditation',
      category: 'mindfulness',
      frequency: 'daily'
    }, token1);
    assert.strictEqual(res.status, 201);
    habit1Id = res.data._id || res.data.id;
  });

  await test('Habits', 'Create Habit 2 (Drink 2L Water)', async () => {
    const res = await request('POST', '/api/habits', {
      name: 'Drink 2L Water',
      category: 'health',
      frequency: 'daily'
    }, token1);
    assert.strictEqual(res.status, 201);
    habit2Id = res.data._id || res.data.id;
  });

  await test('Habits', 'Complete Habit 1 for today and verify streak incremented', async () => {
    const res = await request('POST', `/api/habits/${habit1Id}/complete`, {}, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.streak.current, 1);
    assert.strictEqual(res.data.completedToday, true);
  });

  await test('Habits', 'Prevent duplicate completion of Habit 1 on same day', async () => {
    const res = await request('POST', `/api/habits/${habit1Id}/complete`, {}, token1);
    assert.strictEqual(res.status, 400);
  });

  await test('Habits', 'Complete Habit 2 targets Habit 2 without interfering with Habit 1', async () => {
    const res = await request('POST', `/api/habits/${habit2Id}/complete`, {}, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.name, 'Drink 2L Water');
    assert.strictEqual(res.data.streak.current, 1);
  });

  await test('Habits', 'Undo completion on Habit 1 recalculates streak back to 0', async () => {
    const res = await request('POST', `/api/habits/${habit1Id}/undo`, {}, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.streak.current, 0);
  });

  await test('Habits', 'List habits includes completedToday status for each habit', async () => {
    const res = await request('GET', '/api/habits', null, token1);
    assert.strictEqual(res.status, 200);
    const h1 = res.data.find(h => (h._id || h.id) === habit1Id);
    const h2 = res.data.find(h => (h._id || h.id) === habit2Id);
    assert.strictEqual(h1.completedToday, false, 'Habit 1 was undone');
    assert.strictEqual(h2.completedToday, true, 'Habit 2 remains completed');
  });

  // 9. Timetable & Schedule Service
  await test('Schedule', 'Generate and retrieve daily timetable', async () => {
    const res = await request('GET', '/api/schedule', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.items));
    assert.ok(res.data.items.length > 3);
  });

  await test('Schedule', 'Regenerate schedule with personalized balance', async () => {
    const res = await request('POST', '/api/schedule/regenerate', {}, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.schedule?.items?.length > 3);
  });

  await test('Schedule', 'Toggle schedule item completion status', async () => {
    const schedRes = await request('GET', '/api/schedule', null, token1);
    const firstItem = schedRes.data.items[0];
    const res = await request('PUT', `/api/schedule/items/${firstItem.id}`, { completed: true }, token1);
    assert.strictEqual(res.status, 200);
    const updatedItem = res.data.items.find(i => i.id === firstItem.id);
    assert.strictEqual(updatedItem.completed, true);
  });

  // 10. Connect & Explore Service (Categories, Min/Max Cost, Location Filters)
  await test('Explore', 'Fetch places directory unfiltered', async () => {
    const res = await request('GET', '/api/recommendations/places', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    assert.ok(res.data.length >= 8);
  });

  await test('Explore', 'Filter places by category (cafe)', async () => {
    const res = await request('GET', '/api/recommendations/places?category=cafe', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.every(p => p.category === 'cafe'));
  });

  await test('Explore', 'Filter places by Min and Max Cost range ($5 - $20)', async () => {
    const res = await request('GET', '/api/recommendations/places?minCost=5&maxCost=20', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.length > 0);
    assert.ok(res.data.every(p => p.costAmount >= 5 && p.costAmount <= 20));
  });

  await test('Explore', 'Filter places by Location (Downtown)', async () => {
    const res = await request('GET', '/api/recommendations/places?location=Downtown', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.length > 0);
    assert.ok(res.data.every(p => p.neighborhood === 'Downtown'));
  });

  // 11. Anti-Loneliness Recommendations Service
  await test('Recommendations', 'Retrieve personalized anti-loneliness recommendations', async () => {
    const res = await request('GET', '/api/recommendations', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
  });

  // 12. Dashboard Service
  await test('Dashboard', 'Retrieve aggregated wellness dashboard', async () => {
    const res = await request('GET', '/api/dashboard', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.wellnessScore);
    assert.ok(res.data.stats);
    assert.ok(Array.isArray(res.data.todayHabits));
    assert.ok(Array.isArray(res.data.upcomingTasks));
  });

  // 13. AI Day Review & Companion Confidant Service
  await test('AI Companion', 'Generate complete Day Review & Bedtime Reflection', async () => {
    const text = 'Today was productive and grounding. I walked in the garden, worked on our team project, and made homemade soup tonight.';
    const res = await request('POST', '/api/ai/day-review', { text }, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.headline);
    assert.ok(res.data.narrative);
    assert.ok(res.data.reflectionPrompt);
    assert.ok(res.data.tomorrowIntention);
  });

  await test('AI Companion', 'Retrieve Reflections Archive', async () => {
    const res = await request('GET', '/api/ai/reflections', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    assert.ok(res.data.length >= 1);
  });

  await test('AI Companion', 'Open Companion chat responds with day awareness', async () => {
    const res = await request('POST', '/api/ai/chat', {
      message: 'Can you help me reflect on what I should focus on tomorrow?'
    }, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.reply);
    assert.ok(Array.isArray(res.data.suggestions));
  });

  await test('AI Companion', 'Crisis safety interception returns 988 Lifeline resources', async () => {
    const res = await request('POST', '/api/ai/chat', {
      message: 'I am in deep despair and having thoughts of suicide'
    }, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.isCrisis, true);
    assert.ok(res.data.message.includes('988'));
    assert.ok(res.data.resources);
  });

  // 14. Notifications Service
  await test('Notifications', 'Retrieve user notification center feed', async () => {
    const res = await request('GET', '/api/notifications', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.notifications));
    assert.strictEqual(typeof res.data.unreadCount, 'number');
  });

  await test('Notifications', 'Mark all notifications as read', async () => {
    const res = await request('PUT', '/api/notifications/read-all', {}, token1);
    assert.strictEqual(res.status, 200);
  });

  // 15. Data Export Service
  await test('Export', 'Export full wellness package in JSON format', async () => {
    const res = await request('GET', '/api/export?format=json', null, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.email, email1);
    assert.ok(Array.isArray(res.data.wellness_check_ins));
    assert.ok(Array.isArray(res.data.habits));
  });

  await test('Export', 'Export full wellness dataset in CSV format', async () => {
    const res = await request('GET', '/api/export?format=csv', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.data === 'string');
    assert.ok(res.data.includes('Check-In'));
  });

  // 16. Account Deletion Service
  await test('Account', 'Permanently delete user account and clean up isolated data', async () => {
    const res = await request('DELETE', '/api/users/account', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.message.includes('permanently deleted'));
  });

  console.log('\n======================================================================');
  console.log(`🎉 ALL SERVICES AUDIT COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
};

runVerification();
