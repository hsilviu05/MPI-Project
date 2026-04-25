# 📋 Quality Control Quick Reference

**Print this or bookmark it for quick reference while developing!**

---

## 🐛 Reporting a Bug

### Template Section
Use **Bug Report** issue template

### What to Fill In
| What | Why |
|------|-----|
| **Bug Description** | What's broken, what's the impact? |
| **Steps to Reproduce** ⭐ REQUIRED | Numbered steps anyone can follow |
| **Preconditions** | Are you logged in? What data exists? |
| **Environment** | Browser, OS, API version |
| **Related Issues** | Link to feature story if applicable |

### Example
```
Steps to Reproduce:
1. Go to portfolio page
2. Click "Add holding"
3. Enter symbol "INVALID-TICKER"
4. Click save
→ Expected: Error "Invalid symbol"
→ Actual: Page freezes for 30 seconds
```

### ✅ Before Submitting
- [ ] Include exact reproduction steps
- [ ] List what you expected to happen
- [ ] List what actually happened
- [ ] Include browser/environment details
- [ ] Link to related feature story (if applicable)

---

## ✨ Requesting a Feature

### Template Section
Use **Feature Request / Story** issue template

### What to Fill In
| What | Why |
|------|-----|
| **User Story** | As a X, I want Y so that Z |
| **Acceptance Criteria** ⭐ REQUIRED | Specific, testable conditions |
| **Implementation Details** | Backend/frontend/DevOps specifics |
| **Testing Requirements** | What needs to be tested |

### Example
```
User Story:
As a portfolio owner, I want to see total portfolio value
So that I know my total investment amount

Acceptance Criteria:
- [ ] Total value shows in USD
- [ ] Updates when prices change
- [ ] Calculated including all holdings
- [ ] Shows to 2 decimal places
- [ ] Error message if price data unavailable
```

### ✅ Before Submitting
- [ ] User story is clear
- [ ] Acceptance criteria are testable
- [ ] Testing requirements listed
- [ ] No more than 5-7 acceptance criteria

---

## 📝 Creating a Pull Request

### Before You Start
```bash
# Pull latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b fix/issue-78-portfolio-bug
# or
git checkout -b feat/issue-45-new-feature
```

### When You Create PR
1. **GitHub auto-populates template** ✓
2. **Fill in all sections:**
   ```
   Issue Reference: #78 (also #45 if related)
   [x] I have reviewed the issue's acceptance criteria
   [x] All acceptance criteria are met and testable
   [x] Tests included (unit/integration/e2e)
   ```

3. **Link the issue:** 
   - Type `Closes #78` in description
   - Also mention related issues: `Relates to #45`

### ✅ PR Checklist
- [ ] References the issue number(s)
- [ ] PR template completely filled
- [ ] Tests added (pass locally)
- [ ] Acceptance criteria from issue are met
- [ ] Related bugs/stories linked
- [ ] No merge conflicts
- [ ] Code follows style guidelines

---

## 🔗 Linking Issues

### When to Link
| Type | Link To | Example |
|------|---------|---------|
| Bug | Feature story | Bug #78 → Story #45 |
| Feature | Blocking issues | Feature #45 → Dependency #20 |
| Any | Related PRs | PR references both #78 and #45 |

### How to Link
**In Issue:**
```markdown
**Related Issues:**
- Affects: #45 (Portfolio Management)
- Blocked by: #20 (API authentication)
```

**In PR:**
```markdown
Closes #78 (bug)
Relates to #45 (feature)

This fixes the bug that affects the portfolio feature.
```

---

## ✅ Code Review Process

**Reviewer checks:**
```
✓ Does PR reference the issue?
✓ Are all acceptance criteria met?
✓ Do tests pass?
✓ Is related bug/story properly linked?
✓ Code quality OK?
```

**Comment if:**
- AC not met
- Tests missing or failing
- Issue not referenced
- Related issues not linked

---

## 🚀 Common Workflows

### Workflow 1: Report & Fix a Bug
```
1. Create Bug Issue (#78)
   ├─ Title: [BUG] Portfolio save failing
   ├─ Steps: 1. Login 2. Create portfolio 3. Click save...
   └─ Affects: #45

2. Create Fix PR
   ├─ Title: Fix portfolio save - closes #78
   ├─ Description: References #78 and #45
   └─ Tests: Added regression test

3. Review & Merge
   ├─ Verify bug #78 is fixed
   ├─ Verify feature #45 AC still pass
   └─ Merge
```

### Workflow 2: Implement a Feature
```
1. Create Feature Issue (#45)
   ├─ User Story defined
   ├─ Acceptance Criteria: 5 clear, testable criteria
   └─ Testing requirements listed

2. Create Implementation PR
   ├─ Title: Implement portfolio management - closes #45
   ├─ AC Validation: [x] All 5 criteria met
   └─ Tests: Unit + integration + E2E

3. Review & Merge
   ├─ Verify all AC met
   ├─ Tests passing
   └─ Ready for release
```

---

## 📊 Status Indicators

### On Issues
- 🔴 **Red Label** = High Priority / Critical
- 🟡 **Yellow Label** = Medium
- 🟢 **Green Label** = Low priority
- 🔵 **Blue Label** = Type (bug/feature/chore)

### On PRs
- 🟢 Green check = All tests pass
- 🔴 Red X = Tests failing or validation issues
- 🟡 Yellow dot = Waiting for review
- 📝 = Changes requested

---

## 💡 Pro Tips

1. **Reference template:** Use issue/PR templates - they enforce quality
2. **Be specific:** "Portfolio doesn't save" → "Portfolio save button returns 500 error after 45 seconds"
3. **Link early:** Link issues when you create PR, not after
4. **Test your steps:** Can someone else follow your reproduction steps?
5. **One concern per issue:** Don't mix bugs and features in one issue

---

## 🔍 Quick Links

- **Quality Control Guide:** [`.github/QUALITY_CONTROL.md`](.github/QUALITY_CONTROL.md)
- **Contributing Guide:** [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md)
- **QA Scenarios:** [`QA_SCENARIOS.md`](./QA_SCENARIOS.md)
- **Issue Templates:** [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/)

---

**Questions?** Ask your QA Engineer or check the full guides above.
