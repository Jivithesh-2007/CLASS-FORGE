# Mentor-Idea Collaboration - Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [ ] All files have no syntax errors
- [ ] No console warnings or errors
- [ ] Code follows project conventions
- [ ] All imports are correct
- [ ] No unused variables or functions

### Testing
- [ ] All 15 test cases pass (see MENTOR_COLLABORATION_TESTING.md)
- [ ] No regression in existing features
- [ ] Performance tests pass
- [ ] Mobile responsive verified
- [ ] Error handling tested

### Documentation
- [ ] Implementation guide reviewed
- [ ] Quick start guide reviewed
- [ ] Testing guide reviewed
- [ ] Flow diagrams understood
- [ ] API endpoints documented

### Database
- [ ] MongoDB connection verified
- [ ] Schema changes validated
- [ ] Indexes created if needed
- [ ] Backup taken before deployment

## Deployment Steps

### Step 1: Backend Deployment

#### 1.1 Update Dependencies (if needed)
```bash
cd backend
npm install
```

#### 1.2 Verify Environment Variables
```bash
# Check .env file contains:
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
PORT=5001
NODE_ENV=production
```

#### 1.3 Run Database Migrations
```bash
# No migrations needed for this feature
# Schema changes are backward compatible
```

#### 1.4 Start Backend Server
```bash
npm start
# or for production
npm run start:prod
```

#### 1.5 Verify Backend Health
```bash
curl http://localhost:5001/api/health
# Should return 200 OK
```

### Step 2: Frontend Deployment

#### 2.1 Update Dependencies (if needed)
```bash
cd frontend
npm install
```

#### 2.2 Build Frontend
```bash
npm run build
# Creates optimized production build in dist/
```

#### 2.3 Verify Build
```bash
# Check dist/ folder exists and contains:
# - index.html
# - assets/
# - All component files compiled
```

#### 2.4 Deploy Frontend
```bash
# Option 1: Serve from backend
cp -r dist/* ../backend/public/

# Option 2: Deploy to CDN/hosting service
# Follow your hosting provider's instructions
```

#### 2.5 Verify Frontend
```bash
# Open http://localhost:5173 (or your deployment URL)
# Check all pages load correctly
```

### Step 3: Post-Deployment Verification

#### 3.1 API Endpoints
```bash
# Test all new endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/ideas/mentor/interested-ideas

curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/ideas/mentor/accepted-ideas
```

#### 3.2 Frontend Features
- [ ] Teacher Dashboard loads
- [ ] Tabs work (All Ideas, Interested Ideas, Accepted Ideas)
- [ ] Show Interest button works
- [ ] Message sending works
- [ ] Meet link addition works
- [ ] Accept button works
- [ ] Notifications appear

#### 3.3 Database
```bash
# Check new fields in Idea collection
db.ideas.findOne({
  interestedMentors: { $exists: true }
})

# Check new notification types
db.notifications.findOne({
  type: { $in: ['mentor_interested', 'mentor_message', 'idea_accepted'] }
})
```

#### 3.4 Logs
```bash
# Check for errors in backend logs
tail -f backend/logs/error.log

# Check for errors in browser console
# Open DevTools → Console tab
```

## Rollback Plan

If issues occur, follow these steps:

### Quick Rollback (< 5 minutes)

#### 1. Revert Backend
```bash
cd backend
git revert HEAD
npm install
npm start
```

#### 2. Revert Frontend
```bash
cd frontend
git revert HEAD
npm install
npm run build
```

#### 3. Restore Database (if needed)
```bash
# Restore from backup
mongorestore --uri="mongodb://..." backup/
```

### Full Rollback (if data corruption)

```bash
# 1. Stop services
pm2 stop all

# 2. Restore database from backup
mongorestore --uri="mongodb://..." backup/

# 3. Checkout previous version
git checkout previous-tag

# 4. Reinstall and restart
npm install
npm start
```

## Monitoring Post-Deployment

### 1. Error Tracking
```bash
# Monitor error logs
tail -f backend/logs/error.log

# Check for specific errors
grep "mentor" backend/logs/error.log
grep "discussion" backend/logs/error.log
```

### 2. Performance Monitoring
```bash
# Monitor API response times
# Use tools like:
# - New Relic
# - DataDog
# - Prometheus + Grafana
```

### 3. User Feedback
- [ ] Collect feedback from teachers
- [ ] Collect feedback from students
- [ ] Monitor support tickets
- [ ] Track feature usage

### 4. Database Monitoring
```bash
# Monitor collection sizes
db.ideas.stats()
db.notifications.stats()

# Check for slow queries
db.setProfilingLevel(1, { slowms: 100 })
```

## Performance Optimization

### If Performance Issues Occur

#### 1. Add Database Indexes
```javascript
// In MongoDB
db.ideas.createIndex({ "interestedMentors.mentorId": 1 })
db.ideas.createIndex({ "acceptedBy.mentorId": 1 })
db.ideas.createIndex({ "discussions.mentorId": 1 })
db.notifications.createIndex({ "type": 1, "recipient": 1 })
```

#### 2. Optimize Queries
```javascript
// Use lean() for read-only queries
const ideas = await Idea.find({
  'interestedMentors.mentorId': mentorId
}).lean()

// Use select() to limit fields
const ideas = await Idea.find({
  'interestedMentors.mentorId': mentorId
}).select('title description domain')
```

#### 3. Implement Caching
```javascript
// Cache interested ideas for 5 minutes
const cacheKey = `interested-ideas-${mentorId}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

const ideas = await Idea.find(...)
await redis.setex(cacheKey, 300, JSON.stringify(ideas))
```

## Scaling Considerations

### If Traffic Increases

#### 1. Database Scaling
```bash
# Enable MongoDB replication
# Use MongoDB Atlas for managed scaling
# Consider sharding if needed
```

#### 2. Backend Scaling
```bash
# Use load balancer (nginx, HAProxy)
# Run multiple backend instances
# Use PM2 cluster mode
```

#### 3. Frontend Scaling
```bash
# Use CDN for static assets
# Enable gzip compression
# Implement lazy loading
```

## Maintenance Tasks

### Daily
- [ ] Check error logs
- [ ] Monitor API response times
- [ ] Verify notifications are sending

### Weekly
- [ ] Review user feedback
- [ ] Check database size
- [ ] Verify backups

### Monthly
- [ ] Analyze usage metrics
- [ ] Optimize slow queries
- [ ] Update dependencies

## Troubleshooting Guide

### Issue: Notifications Not Sending

**Symptoms**: Users don't receive notifications

**Solution**:
```bash
# 1. Check notification service
curl http://localhost:5001/api/notifications

# 2. Check database
db.notifications.find({ isRead: false }).count()

# 3. Check socket connection
# Open browser console, check for socket errors

# 4. Restart notification service
pm2 restart notification-service
```

### Issue: Accept Button Not Working

**Symptoms**: "Accept Idea" button doesn't work

**Solution**:
```bash
# 1. Check API endpoint
curl -X POST http://localhost:5001/api/ideas/ID/accept \
  -H "Authorization: Bearer TOKEN"

# 2. Check user role
# Verify user has 'teacher' or 'admin' role

# 3. Check idea status
db.ideas.findById(ID)
# Verify acceptedBy is null

# 4. Check browser console for errors
```

### Issue: Messages Not Appearing

**Symptoms**: Sent messages don't appear

**Solution**:
```bash
# 1. Check message in database
db.ideas.findById(ID).discussions

# 2. Check API response
curl -X POST http://localhost:5001/api/ideas/ID/discussions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"test"}'

# 3. Check frontend state management
# Verify component is fetching latest data

# 4. Clear browser cache and reload
```

### Issue: Meet Link Not Saving

**Symptoms**: Google Meet link doesn't save

**Solution**:
```bash
# 1. Verify link format
# Should be: https://meet.google.com/xxx-xxxx-xxx

# 2. Check API endpoint
curl -X PUT http://localhost:5001/api/ideas/ID/discussions/DISC_ID/meet-link \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"meetLink":"https://meet.google.com/xxx"}'

# 3. Check database
db.ideas.findById(ID).discussions[0].meetLink

# 4. Verify discussion exists
# If not, send message first to create discussion
```

## Support Contacts

- **Backend Issues**: Backend Team
- **Frontend Issues**: Frontend Team
- **Database Issues**: DevOps Team
- **General Support**: Support Team

## Deployment Checklist Summary

```
PRE-DEPLOYMENT
[ ] Code quality verified
[ ] All tests passing
[ ] Documentation complete
[ ] Database backup taken

DEPLOYMENT
[ ] Backend deployed
[ ] Frontend deployed
[ ] Environment variables set
[ ] Database migrations run

POST-DEPLOYMENT
[ ] API endpoints verified
[ ] Frontend features working
[ ] Notifications sending
[ ] No errors in logs
[ ] Performance acceptable

MONITORING
[ ] Error tracking enabled
[ ] Performance monitoring enabled
[ ] User feedback collected
[ ] Database monitored
```

## Success Criteria

Deployment is successful when:

✅ All API endpoints respond correctly
✅ Frontend loads without errors
✅ Notifications send to all teachers
✅ Show interest functionality works
✅ Message sending works
✅ Meet link addition works
✅ Idea acceptance works
✅ No console errors
✅ Mobile responsive
✅ Performance acceptable (< 2s load time)
✅ Database queries optimized
✅ Users can complete full workflow

## Next Steps After Deployment

1. **Monitor for 24 hours**
   - Watch error logs
   - Monitor performance
   - Collect user feedback

2. **Gather Feedback**
   - Send survey to teachers
   - Send survey to students
   - Collect feature requests

3. **Plan Enhancements**
   - Email notifications
   - Real-time updates
   - Analytics dashboard
   - Mentor ratings

4. **Schedule Review**
   - 1 week post-deployment
   - 1 month post-deployment
   - Quarterly review

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Verified By**: _______________
**Notes**: _______________
