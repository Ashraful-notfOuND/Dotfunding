# Dynamic Recommendation & Notification System

A comprehensive feature demonstrating the integration of **4 design patterns** (Strategy, Factory, Decorator, Observer) to create a scalable and maintainable recommendation and notification system for DotFunding.

## 📋 Overview

This system provides personalized project recommendations to backers and sends multi-channel notifications when relevant projects are created or updated.

## 🎯 Features

### 1. **Personalized Recommendations**
- Interest-based matching
- Trending project detection
- Collaborative filtering (similar users)
- Past pledge analysis

### 2. **Multi-Channel Notifications**
- In-app notifications
- Email notifications
- SMS notifications (placeholder)
- Push notifications (placeholder)

### 3. **Enhanced Notifications**
- Priority levels (urgent, high, normal, low)
- Personalization with user names
- Rich formatting (emojis, colors, styling)
- Scheduled delivery
- Automatic retry on failure
- Tracking and analytics

### 4. **Project Subscriptions**
- Subscribe to specific projects
- Get notified on updates, milestones, comments
- Customizable notification preferences

---

## 🏗️ Design Patterns Implemented

### 1. Strategy Pattern - Recommendation Algorithms

**Location**: `src/services/RecommendationStrategy.js`

**Purpose**: Allows different recommendation algorithms to be used interchangeably without changing client code.

**Strategies**:
- `InterestBasedStrategy`: Matches projects with user's saved interests
- `TrendingStrategy`: Recommends trending/popular projects
- `CollaborativeFilteringStrategy`: Suggests based on similar users' preferences
- `PastPledgeStrategy`: Recommends similar to previously backed projects

**Usage**:
```javascript
import { RecommendationEngine, RecommendationStrategyFactory } from './services/RecommendationStrategy.js';

// Create recommendation engine with specific strategy
const strategy = RecommendationStrategyFactory.createStrategy('interest');
const engine = new RecommendationEngine(strategy);

// Get recommendations
const recommendations = await engine.getRecommendations(userId, 10);

// Switch strategy dynamically
engine.setStrategy(RecommendationStrategyFactory.createStrategy('trending'));
```

---

### 2. Factory Pattern - Multi-Channel Notifications

**Location**: `src/services/NotificationFactory.js`

**Purpose**: Creates notification objects for different channels without exposing creation logic.

**Products**:
- `InAppNotification`: Stores in database, shown in app
- `EmailNotification`: Sends formatted HTML emails
- `SMSNotification`: Sends SMS (Twilio integration ready)
- `PushNotification`: Sends push notifications (Firebase ready)

**Usage**:
```javascript
import { NotificationFactory } from './services/NotificationFactory.js';

// Create single channel notification
const notification = NotificationFactory.createNotification(
  'email',
  recipient,
  'You have a new recommendation!',
  { projectId: '123', projectTitle: 'Cool Project' }
);

await notification.send();

// Create multi-channel notifications
const notifications = NotificationFactory.createMultiChannel(
  ['in-app', 'email', 'push'],
  recipient,
  message,
  metadata
);

await Promise.all(notifications.map(n => n.send()));
```

---

### 3. Decorator Pattern - Enhanced Notifications

**Location**: `src/services/NotificationDecorator.js`

**Purpose**: Dynamically add features to notifications without modifying the base class.

**Decorators**:
- `PriorityDecorator`: Adds priority levels
- `PersonalizationDecorator`: Adds user's name
- `RichFormattingDecorator`: Adds emojis, colors, styling
- `ScheduledDecorator`: Schedules future delivery
- `TrackingDecorator`: Adds tracking ID and metrics
- `RetryDecorator`: Retries failed notifications

**Usage**:
```javascript
import { NotificationBuilder } from './services/NotificationDecorator.js';
import { NotificationFactory } from './services/NotificationFactory.js';

// Create base notification
const notification = NotificationFactory.createNotification(
  'email',
  recipient,
  'New project matches your interests!'
);

// Add decorators using builder pattern
const enhanced = new NotificationBuilder(notification)
  .withPriority('urgent')
  .withPersonalization('John Doe')
  .withFormatting({ emoji: '🎯', bold: true })
  .withTracking()
  .withRetry(3, 2000)
  .build();

const result = await enhanced.send();
```

---

### 4. Observer Pattern - Project Subscriptions

**Location**: `src/services/ProjectObserver.js`

**Purpose**: Notifies subscribers automatically when projects they follow are updated.

**Components**:
- `ProjectSubject`: Manages subscribers for a project
- `ObserverManager`: Centralized management of all subscriptions

**Usage**:
```javascript
import { observerManager } from './services/ProjectObserver.js';

// Subscribe to project updates
await observerManager.subscribeUser(projectId, userId, {
  onUpdate: true,
  onMilestone: true,
  onComment: false,
  channels: ['in-app', 'email']
});

// Notify all subscribers when project is updated
await observerManager.notifyProjectEvent(projectId, 'project_update', {
  projectTitle: 'Amazing Project',
  updateDescription: 'We reached 50% funding!'
});

// Notify users interested in a category when new project is created
await observerManager.notifyInterestedUsers(project);
```

---

## 🗄️ Database Schema

Run the migration script in Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `backend/database/recommendation_system_schema.sql`
5. Run the migration

**Or run directly via Supabase client**:

```javascript
import { supabase } from './config/supabaseClient.js';
import fs from 'fs';

const sql = fs.readFileSync('./database/recommendation_system_schema.sql', 'utf8');
await supabase.rpc('exec_sql', { sql_query: sql });
```

**Tables Created**:
1. `user_interests`: Stores user's preferred categories
2. `project_subscriptions`: Tracks who's subscribed to which projects
3. `recommendation_history`: Logs recommendation impressions and clicks
4. **Extended tables**: `users`, `notifications`, `projects`

---

## 🚀 API Endpoints

### Recommendations

```http
# Get personalized recommendations
GET /api/recommendations/:userId?strategy=interest&limit=10

# Get combined recommendations from all strategies
GET /api/recommendations/:userId/combined?limit=20
```

### Subscriptions

```http
# Subscribe to project updates
POST /api/recommendations/subscriptions/:projectId/:userId
Body: {
  "onUpdate": true,
  "onMilestone": true,
  "channels": ["in-app", "email"]
}

# Unsubscribe from project
DELETE /api/recommendations/subscriptions/:projectId/:userId

# Get user's subscriptions
GET /api/recommendations/subscriptions/user/:userId
```

### User Interests

```http
# Get user interests
GET /api/recommendations/interests/:userId

# Update user interests
PUT /api/recommendations/interests/:userId
Body: {
  "categories": ["Technology", "Art", "Music"]
}
```

### Notification Preferences

```http
# Update notification preferences
PUT /api/recommendations/preferences/:userId
Body: {
  "channels": ["in-app", "email", "push"],
  "frequency": "instant",
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00"
  }
}
```

---

## 🧪 Testing

Run the test suite:

```bash
cd backend
npm test
```

**Test Files**:
- `tests/RecommendationStrategy.test.js`: Strategy pattern tests
- `tests/NotificationFactory.test.js`: Factory pattern tests
- `tests/NotificationDecorator.test.js`: Decorator pattern tests

---

## 📦 Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "nodemailer": "^6.9.0"
  }
}
```

Install:
```bash
npm install nodemailer
```

---

## ⚙️ Environment Variables

Add to `.env`:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="DotFunding <noreply@dotfunding.com>"

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:8080

# Optional: SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE=+1234567890

# Optional: Push Notifications (Firebase)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

---

## 🎓 Educational Value

This implementation demonstrates:

1. **Strategy Pattern**: Swappable recommendation algorithms
2. **Factory Pattern**: Creating objects without exposing instantiation logic
3. **Decorator Pattern**: Adding features dynamically at runtime
4. **Observer Pattern**: Event-driven notifications to subscribers

### Benefits:
- ✅ **Modularity**: Each pattern is in its own module
- ✅ **Extensibility**: Easy to add new strategies, channels, or decorators
- ✅ **Testability**: Each pattern can be tested independently
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Scalability**: Can handle growing user base and features

---

## 📈 Integration Examples

### Example 1: Notify users when new project matches their interests

```javascript
// In projectController.js when creating a project
import { observerManager } from '../services/ProjectObserver.js';

export const createProject = async (req, res) => {
  // ... create project logic ...
  
  // Notify interested users
  await observerManager.notifyInterestedUsers(newProject);
  
  res.status(201).json({ project: newProject });
};
```

### Example 2: Send personalized recommendation email

```javascript
import { RecommendationEngine, RecommendationStrategyFactory } from './services/RecommendationStrategy.js';
import { NotificationFactory } from './services/NotificationFactory.js';
import { NotificationBuilder } from './services/NotificationDecorator.js';

// Get recommendations
const strategy = RecommendationStrategyFactory.createStrategy('interest');
const engine = new RecommendationEngine(strategy);
const projects = await engine.getRecommendations(user.id, 3);

// Send email with recommendations
const notification = NotificationFactory.createNotification(
  'email',
  user,
  'We found some projects you might like!',
  {
    projectTitle: projects[0].title,
    projectDescription: projects[0].tagline,
    projectUrl: `${process.env.FRONTEND_URL}/project/${projects[0].id}`,
    subject: 'New Project Recommendations for You'
  }
);

await new NotificationBuilder(notification)
  .withPersonalization(user.full_name)
  .withPriority('normal')
  .withTracking()
  .send();
```

---

## 🔮 Future Enhancements

1. **Machine Learning**: Replace rule-based strategies with ML models
2. **Real-time WebSockets**: Push notifications without polling
3. **A/B Testing**: Test different recommendation strategies
4. **Analytics Dashboard**: Track recommendation performance
5. **Email Templates**: Rich HTML email designs
6. **Rate Limiting**: Prevent notification spam
7. **Batch Processing**: Send notifications in batches for efficiency

---

## 👥 Contributors

Developed as part of the Software Design Patterns assignment for DotFunding crowdfunding platform.

---

## 📝 License

MIT License - Feel free to use for educational purposes.
