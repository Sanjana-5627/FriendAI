// Automated Test Suite for FriendAI Backend
// Tests Auth, User Isolation, Profile, Check-In, Tasks, Goals, Habits, Schedule, Recommendations, Export & Safety
process.env.NODE_ENV = 'test';
import assert from 'node:assert';
import app from '../server.js';

// Bind server to an ephemeral available port to avoid port collision
const server = app.listen(0);

const runTests = async () => {
  console.log('\n🧪 Starting FriendAI Backend Automated Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✅ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ ${name}:`, err.message);
      failed++;
    }
  };

  const getPort = () => {
    const addr = server.address();
    return typeof addr === 'object' && addr ? addr.port : 5002;
  };

  const request = async (method, path, body = null, token = null) => {
    const port = getPort();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });

    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  let token1 = null;
  let token2 = null;
  let user1Id = null;
  let user2Id = null;
  const testEmail1 = `alice_${Date.now()}@test.com`;
  const testEmail2 = `bob_${Date.now()}@test.com`;

  // 1. Auth Tests
  await test('User 1 Registration', async () => {
    const res = await request('POST', '/api/auth/register', {
      name: 'Alice Wonder',
      email: testEmail1,
      password: 'securePassword123'
    });
    assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}`);
    assert.ok(res.data.token, 'Token should be returned');
    assert.strictEqual(res.data.user.name, 'Alice Wonder');
    token1 = res.data.token;
    user1Id = res.data.user.id;
  });

  await test('User 2 Registration (for data isolation testing)', async () => {
    const res = await request('POST', '/api/auth/register', {
      name: 'Bob Builder',
      email: testEmail2,
      password: 'securePassword456'
    });
    assert.strictEqual(res.status, 201);
    token2 = res.data.token;
    user2Id = res.data.user.id;
  });

  await test('User Login with valid credentials', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: testEmail1,
      password: 'securePassword123'
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token);
  });

  await test('User Login with invalid credentials rejected', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: testEmail1,
      password: 'wrongPassword'
    });
    assert.strictEqual(res.status, 401);
  });

  await test('/api/auth/me returns full user profile', async () => {
    const res = await request('GET', '/api/auth/me', null, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.name, 'Alice Wonder');
    assert.ok(res.data.user.profile, 'Profile must be present');
  });

  // 2. Profile Management
  await test('Update user wellness profile', async () => {
    const res = await request('PUT', '/api/users/profile', {
      profile: {
        interests: ['hiking', 'creative writing', 'chess'],
        fitness_level: 'active',
        sleep_schedule: { bedtime: '22:30', wake_time: '06:30', typical_hours: 8 }
      }
    }, token1);
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.data.profile.interests, ['hiking', 'creative writing', 'chess']);
  });

  // 3. Daily Wellness Check-In
  await test('Submit daily wellness check-in', async () => {
    const res = await request('POST', '/api/wellness/check-in', {
      mood: 8,
      energy: 7,
      stress: 4,
      sleep_hours: 8,
      sleep_quality: 'good',
      physical_activity: 'light_walk',
      social_interaction: 'moderate',
      screen_time_hours: 4.5,
      productivity: 7,
      notes: 'Felt very energized after a morning walk!'
    }, token1);
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.checkIn.mood, 8);
  });

  await test('Verify check-in today status is completed', async () => {
    const res = await request('GET', '/api/wellness/check-in/today', null, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.completed, true);
  });

  // 4. Tasks & User Data Isolation
  let createdTaskId = null;
  await test('Create task with priority and category', async () => {
    const res = await request('POST', '/api/tasks', {
      title: 'Finish report draft',
      priority: 'high',
      category: 'work',
      due_date: new Date(Date.now() + 86400000).toISOString()
    }, token1);
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.title, 'Finish report draft');
    createdTaskId = res.data._id || res.data.id;
  });

  await test('User 2 cannot see or access User 1 tasks (Data Isolation)', async () => {
    const res = await request('GET', '/api/tasks', null, token2);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.length, 0, 'User 2 should see 0 tasks');
  });

  await test('Complete task toggle updates cleanly', async () => {
    const res = await request('PUT', `/api/tasks/${createdTaskId}`, {
      completed: true
    }, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.completed, true);
  });

  // 5. Goals & Habits
  await test('Create goal with milestones', async () => {
    const res = await request('POST', '/api/goals', {
      title: 'Run a 5K race',
      category: 'health',
      milestones: [
        { title: 'Buy running shoes', completed: true },
        { title: 'Run 2km without stopping', completed: false }
      ]
    }, token1);
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.progress, 50);
  });

  let habitId = null;
  await test('Create habit and verify streak calculation', async () => {
    const res = await request('POST', '/api/habits', {
      name: 'Drink 2L Water',
      category: 'health',
      frequency: 'daily'
    }, token1);
    assert.strictEqual(res.status, 201);
    habitId = res.data._id || res.data.id;

    const compRes = await request('POST', `/api/habits/${habitId}/complete`, {}, token1);
    assert.strictEqual(compRes.status, 200);
    assert.strictEqual(compRes.data.streak.current, 1);
  });

  await test('Prevent duplicate habit completion on same day', async () => {
    const res = await request('POST', `/api/habits/${habitId}/complete`, {}, token1);
    assert.strictEqual(res.status, 400, 'Duplicate completion should be rejected');
  });

  // 6. Schedule & Timetable
  await test('Generate and retrieve daily timetable', async () => {
    const res = await request('GET', '/api/schedule', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.items), 'Schedule should contain timetable items');
    assert.ok(res.data.items.length > 3, 'Should have multiple balanced daily slots');
  });

  // 7. Recommendations & Places Explorer
  await test('Fetch anti-loneliness recommendations', async () => {
    const res = await request('GET', '/api/recommendations', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
  });

  await test('Fetch nearby places & activities directory with category filter', async () => {
    const res = await request('GET', '/api/recommendations/places?category=park', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    assert.ok(res.data.every(p => p.category === 'park'));
  });

  // 8. Safety & Crisis Intervention
  await test('Crisis detection triggers compassionate response with 988 lifeline', async () => {
    const res = await request('POST', '/api/ai/chat', {
      message: 'I feel so hopeless and want to end my life'
    }, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.isCrisis, true, 'isCrisis flag must be true');
    assert.ok(res.data.message.includes('988'), 'Must include 988 lifeline');
    assert.ok(res.data.resources, 'Must provide crisis helpline resources');
  });

  // 9. Dashboard Aggregation
  await test('Dashboard returns calculated wellness score and widgets', async () => {
    const res = await request('GET', '/api/dashboard', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.wellnessScore.total >= 0 && res.data.wellnessScore.total <= 100);
    assert.ok(res.data.wellnessScore.breakdown, 'Should include score breakdown');
    assert.ok(res.data.socialHealth, 'Should include social health indicator');
  });

  // 10. Data Export
  await test('Data export in JSON format', async () => {
    const res = await request('GET', '/api/export?format=json', null, token1);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.email, testEmail1);
    assert.ok(Array.isArray(res.data.wellness_check_ins));
  });

  // 11. Day Review & Reflections Soul Feature
  await test('Generate complete Day Review and Bedtime Reflection', async () => {
    const dayText = 'Today was quite a whirlwind. I worked hard on our design system sprint, had lunch in the courtyard sunlight, but felt overwhelmed around 4pm when three urgent emails arrived. I took a short walk and finished the day cooking pasta.';
    const res = await request('POST', '/api/ai/day-review', { text: dayText }, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.headline, 'Must return review headline');
    assert.ok(res.data.narrative, 'Must return warm review narrative');
    assert.ok(Array.isArray(res.data.highlights), 'Must return highlights array');
    assert.ok(res.data.reflectionPrompt, 'Must return quiet reflection prompt');
    assert.ok(res.data.tomorrowIntention, 'Must return tomorrow micro-intention');
    assert.ok(res.data.id, 'Must return saved reflection entry ID');
  });

  await test('Retrieve Reflections Archive', async () => {
    const res = await request('GET', '/api/ai/reflections', null, token1);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data), 'Must return reflections array');
    assert.ok(res.data.length >= 1, 'Should contain at least one saved day review');
  });

  // 12. Instant Demo Login
  await test('Instant Demo Login returns seeded demo user token', async () => {
    const res = await request('POST', '/api/auth/demo');
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token, 'Must return valid JWT token');
    assert.strictEqual(res.data.user.email, 'demo@friendai.com');
  });

  console.log(`\n================================`);
  console.log(`🎉 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`================================\n`);

  server.close(() => {
    process.exit(failed > 0 ? 1 : 0);
  });
};

if (server.listening) {
  runTests();
} else {
  server.on('listening', runTests);
}
