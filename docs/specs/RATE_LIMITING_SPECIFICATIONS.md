# 🛡️ Rate Limiting Specifications - DentiaGest

## 🏴‍☠️ Development Mode

**STATUS: CURRENTLY DISABLED FOR DEVELOPMENT**

```python
# DEVELOPMENT ANARCHY MODE ACTIVATED
if settings.environment == "development":
    return True, None, None  # All rate limiting bypassed
```

**WHY DISABLED:**
- React development mode generates 300+ requests for simple drag & drop operations
- Double effects, hot reloading, and aggressive re-fetching make development impossible
- Need to test UI/UX without security getting in the way

**TO ENABLE IN PRODUCTION:**
Change `environment = "development"` → `environment = "production"` in settings

---

## 🏥 Production Rate Limits (When Enabled)

### 🔒 Login Attempts (STRICT)
- **5 requests/minute** - Brute force protection
- **20 requests/hour** - Account security
- **3 burst limit** - Failed login tolerance

### 🏥 Medical Record Access (REALISTIC)
- **100 requests/minute** - Busy doctor/receptionist workflow
- **1000 requests/hour** - Heavy usage days (chart reviews, emergencies)
- **50 burst limit** - Quick patient record searches

**RATIONALE:** A busy doctor might legitimately access 60+ patient records per hour during patient rounds or emergency situations.

### 🔍 Patient Data Queries (SEARCH-FRIENDLY)
- **150 requests/minute** - Autocomplete, search, patient lookup
- **1500 requests/hour** - Full day of patient management
- **75 burst limit** - Rapid autocomplete responses

**RATIONALE:** Patient search with autocomplete can generate many rapid requests. Receptionists scheduling appointments need quick patient lookup capabilities.

### 🚀 General API (GENEROUS)
- **200 requests/minute** - Normal UI interactions
- **2000 requests/hour** - Active work session
- **100 burst limit** - UI state changes, navigation

---

## 🎯 Real-World Usage Scenarios

### 📋 **Busy Reception Morning (9-11 AM)**
- **Patient check-ins:** 20 patients = ~60 API calls (patient lookup + appointment update)
- **Appointment scheduling:** 15 new appointments = ~45 API calls
- **Phone inquiries:** 10 patient lookups = ~30 API calls
- **TOTAL:** ~135 requests in 2 hours = **67 requests/hour** ✅ WITHIN LIMITS

### 🏥 **Doctor Emergency Mode**
- **Emergency patient:** Rapid chart access = ~20 requests in 2 minutes
- **Medical history review:** 5 previous visits = ~15 requests
- **Treatment notes:** Update + save = ~10 requests
- **TOTAL:** ~45 requests in 5 minutes = **9 requests/minute** ✅ WITHIN LIMITS

### 🔍 **Receptionist "Search Frenzy"**
- **Patient search with typos:** 10 autocomplete searches = ~30 requests
- **Multiple patient bookings:** 5 patients found + scheduled = ~25 requests
- **Insurance verification:** 5 patient insurance checks = ~15 requests
- **TOTAL:** ~70 requests in 5 minutes = **14 requests/minute** ✅ WITHIN LIMITS

---

## ⚠️ When Rate Limiting Triggers

### 🚨 **Legitimate Cases That Might Trigger Limits:**
1. **Mass patient import/export operations**
2. **End-of-day reporting with large datasets**
3. **Insurance batch processing**
4. **Multiple users sharing same IP (clinic WiFi)**

### 🏴‍☠️ **Development Cases That WILL Trigger:**
1. **React hot reloading** (dozens of automatic re-fetches)
2. **Drag & drop testing** (every pixel move = new request)
3. **Modal open/close rapid testing** (state changes trigger fetches)
4. **Browser dev tools network throttling tests**

---

## 🔧 Emergency Bypass Commands

### Reset Rate Limiting Memory:
```bash
curl -X POST http://localhost:8002/api/dev/reset-rate-limits
```

### Temporary Disable (Development):
```python
# In threat_detection.py
if settings.environment == "development":
    return True, None, None  # YOLO MODE
```

---

## 📊 Monitoring & Alerts

**WHEN PRODUCTION LAUNCHES:**

1. **Monitor rate limit violations** - legitimate users hitting limits
2. **Adjust limits based on real usage patterns**
3. **Set up alerts for mass violations** (potential attacks)
4. **Prepare for angry emails** from staff when limits are too strict 📧😡

---

## 🎭 Future Considerations

### 👥 **Multi-User Clinics:**
- Rate limiting per USER_ID vs per IP_ADDRESS
- Higher limits for admin/doctor roles vs receptionist roles
- Whitelist internal clinic IP ranges

### 🌐 **Geographic Distribution:**
- Different limits for different regions
- Time-based limits (higher during business hours)
- Holiday/emergency mode with relaxed limits

### 🤖 **API Integration Partners:**
- Separate rate limits for third-party integrations
- API key-based rate limiting
- Partner-specific quotas

---

## 💡 Lessons Learned

1. **Security vs Usability:** Perfect security that blocks legitimate users is useless security
2. **Development vs Production:** What works in dev doesn't necessarily work in production
3. **Real-World Testing:** Only real users reveal true usage patterns
4. **Progressive Rollout:** Start permissive, tighten based on data

---

**REMEMBER:** The goal is to stop attackers, not annoy doctors! 🏥✊
