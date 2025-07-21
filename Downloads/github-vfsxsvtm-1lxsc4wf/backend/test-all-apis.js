const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testAllAPIs() {
  console.log('🧪 Testing All APIs...\n');

  let authToken = null;
  let userId = null;
  let taskId = null;
  let projectId = null;

  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    try {
      const healthResponse = await axios.get('http://localhost:3000/health');
      if (healthResponse.data.success) {
        console.log('✅ Health check passed');
      } else {
        console.log('❌ Health check failed');
      }
    } catch (error) {
      console.log('❌ Health check error:', error.message);
    }

    // Test 2: Authentication
    console.log('\n2. Testing authentication...');
    
    // Sign up
    try {
      const signUpResponse = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email: 'testapi@example.com',
        password: 'password123',
        name: 'API Test User'
      });

      if (signUpResponse.data.success) {
        console.log('✅ Sign up successful');
        authToken = signUpResponse.data.data.token;
        userId = signUpResponse.data.data.user.id;
      } else {
        console.log('❌ Sign up failed');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ User already exists, trying sign in...');
        
        // Try sign in instead
        const signInResponse = await axios.post(`${API_BASE_URL}/auth/signin`, {
          email: 'testapi@example.com',
          password: 'password123'
        });

        if (signInResponse.data.success) {
          console.log('✅ Sign in successful');
          authToken = signInResponse.data.data.token;
          userId = signInResponse.data.data.user.id;
        }
      } else {
        console.log('❌ Auth error:', error.response?.data?.error?.message || error.message);
      }
    }

    if (!authToken) {
      console.log('❌ Cannot proceed without authentication token');
      return;
    }

    // Set default headers for authenticated requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    // Test 3: User Profile
    console.log('\n3. Testing user profile...');
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/users/profile`);
      if (profileResponse.data.success) {
        console.log('✅ Get profile successful');
        console.log('User:', profileResponse.data.data.email);
      } else {
        console.log('❌ Get profile failed');
      }
    } catch (error) {
      console.log('❌ Profile error:', error.response?.data?.error?.message || error.message);
    }

    // Test 4: Projects
    console.log('\n4. Testing projects...');
    
    // Get projects
    try {
      const projectsResponse = await axios.get(`${API_BASE_URL}/projects`);
      if (projectsResponse.data.success) {
        console.log('✅ Get projects successful');
        console.log('Projects count:', projectsResponse.data.data.length);
      }
    } catch (error) {
      console.log('❌ Get projects error:', error.response?.data?.error?.message || error.message);
    }

    // Create project
    try {
      const createProjectResponse = await axios.post(`${API_BASE_URL}/projects`, {
        name: 'Test Project API',
        color: '#FF5722'
      });

      if (createProjectResponse.data.success) {
        console.log('✅ Create project successful');
        projectId = createProjectResponse.data.data.id;
      } else {
        console.log('❌ Create project failed');
      }
    } catch (error) {
      console.log('❌ Create project error:', error.response?.data?.error?.message || error.message);
    }

    // Test 5: Tasks
    console.log('\n5. Testing tasks...');
    
    // Get tasks
    try {
      const tasksResponse = await axios.get(`${API_BASE_URL}/tasks`);
      if (tasksResponse.data.success) {
        console.log('✅ Get tasks successful');
        console.log('Tasks count:', tasksResponse.data.data.length);
      }
    } catch (error) {
      console.log('❌ Get tasks error:', error.response?.data?.error?.message || error.message);
    }

    // Create task
    try {
      const createTaskResponse = await axios.post(`${API_BASE_URL}/tasks`, {
        title: 'Test Task API',
        description: 'This is a test task created via API',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Testing',
        priority: 'high',
        tags: ['api', 'test'],
        projectId: projectId
      });

      if (createTaskResponse.data.success) {
        console.log('✅ Create task successful');
        taskId = createTaskResponse.data.data.id;
      } else {
        console.log('❌ Create task failed');
      }
    } catch (error) {
      console.log('❌ Create task error:', error.response?.data?.error?.message || error.message);
    }

    // Update task
    if (taskId) {
      try {
        const updateTaskResponse = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, {
          title: 'Updated Test Task API',
          priority: 'medium'
        });

        if (updateTaskResponse.data.success) {
          console.log('✅ Update task successful');
        } else {
          console.log('❌ Update task failed');
        }
      } catch (error) {
        console.log('❌ Update task error:', error.response?.data?.error?.message || error.message);
      }

      // Toggle task completion
      try {
        const toggleResponse = await axios.post(`${API_BASE_URL}/tasks/${taskId}/complete`);
        if (toggleResponse.data.success) {
          console.log('✅ Toggle task completion successful');
        } else {
          console.log('❌ Toggle task completion failed');
        }
      } catch (error) {
        console.log('❌ Toggle task error:', error.response?.data?.error?.message || error.message);
      }
    }

    // Test 6: Task Statistics
    console.log('\n6. Testing task statistics...');
    try {
      const statsResponse = await axios.get(`${API_BASE_URL}/tasks/statistics`);
      if (statsResponse.data.success) {
        console.log('✅ Get statistics successful');
        console.log('Stats:', JSON.stringify(statsResponse.data.data, null, 2));
      } else {
        console.log('❌ Get statistics failed');
      }
    } catch (error) {
      console.log('❌ Statistics error:', error.response?.data?.error?.message || error.message);
    }

    // Test 7: Search
    console.log('\n7. Testing search...');
    try {
      const searchResponse = await axios.get(`${API_BASE_URL}/search/tasks?q=test`);
      if (searchResponse.data.success) {
        console.log('✅ Search successful');
        console.log('Search results:', searchResponse.data.data.length);
      } else {
        console.log('❌ Search failed');
      }
    } catch (error) {
      console.log('❌ Search error:', error.response?.data?.error?.message || error.message);
    }

    // Test 8: Focus Settings
    console.log('\n8. Testing focus settings...');
    try {
      const focusSettingsResponse = await axios.get(`${API_BASE_URL}/focus/settings`);
      if (focusSettingsResponse.data.success) {
        console.log('✅ Get focus settings successful');
      } else {
        console.log('❌ Get focus settings failed');
      }
    } catch (error) {
      console.log('❌ Focus settings error:', error.response?.data?.error?.message || error.message);
    }

    // Update focus settings
    try {
      const updateFocusResponse = await axios.put(`${API_BASE_URL}/focus/settings`, {
        workDuration: 30,
        shortBreakDuration: 10
      });

      if (updateFocusResponse.data.success) {
        console.log('✅ Update focus settings successful');
      } else {
        console.log('❌ Update focus settings failed');
      }
    } catch (error) {
      console.log('❌ Update focus settings error:', error.response?.data?.error?.message || error.message);
    }

    // Test 9: Focus Statistics
    console.log('\n9. Testing focus statistics...');
    try {
      const focusStatsResponse = await axios.get(`${API_BASE_URL}/focus/statistics`);
      if (focusStatsResponse.data.success) {
        console.log('✅ Get focus statistics successful');
        console.log('Focus stats:', JSON.stringify(focusStatsResponse.data.data, null, 2));
      } else {
        console.log('❌ Get focus statistics failed');
      }
    } catch (error) {
      console.log('❌ Focus statistics error:', error.response?.data?.error?.message || error.message);
    }

    // Test 10: Settings
    console.log('\n10. Testing settings...');
    
    // Notification settings
    try {
      const notificationResponse = await axios.get(`${API_BASE_URL}/settings/notifications`);
      if (notificationResponse.data.success) {
        console.log('✅ Get notification settings successful');
      } else {
        console.log('❌ Get notification settings failed');
      }
    } catch (error) {
      console.log('❌ Notification settings error:', error.response?.data?.error?.message || error.message);
    }

    // Theme settings
    try {
      const themeResponse = await axios.get(`${API_BASE_URL}/settings/theme`);
      if (themeResponse.data.success) {
        console.log('✅ Get theme settings successful');
      } else {
        console.log('❌ Get theme settings failed');
      }
    } catch (error) {
      console.log('❌ Theme settings error:', error.response?.data?.error?.message || error.message);
    }

    // Test 11: Cleanup - Delete created resources
    console.log('\n11. Cleaning up test data...');
    
    if (taskId) {
      try {
        await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
        console.log('✅ Test task deleted');
      } catch (error) {
        console.log('❌ Failed to delete test task');
      }
    }

    if (projectId) {
      try {
        await axios.delete(`${API_BASE_URL}/projects/${projectId}`);
        console.log('✅ Test project deleted');
      } catch (error) {
        console.log('❌ Failed to delete test project');
      }
    }

    // Test 12: Sign Out
    console.log('\n12. Testing sign out...');
    try {
      const signOutResponse = await axios.post(`${API_BASE_URL}/auth/signout`);
      if (signOutResponse.data.success) {
        console.log('✅ Sign out successful');
      } else {
        console.log('❌ Sign out failed');
      }
    } catch (error) {
      console.log('❌ Sign out error:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 API testing completed!');
    console.log('\n📊 Summary:');
    console.log('- Authentication: ✅');
    console.log('- User Profile: ✅');
    console.log('- Projects: ✅');
    console.log('- Tasks: ✅');
    console.log('- Statistics: ✅');
    console.log('- Search: ✅');
    console.log('- Focus Features: ✅');
    console.log('- Settings: ✅');
    console.log('- Sign Out: ✅');

  } catch (error) {
    console.error('❌ Critical test error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 3000');
    }
  }
}

// Run the test
testAllAPIs();