# Quality Control & Release Process Guide

> **Goal:** Validate pull requests against acceptance criteria, ensure bugs have reproduction steps, and link bugs to affected feature stories for better release quality.

---

## 📊 System Overview

```
Issue Created
    ↓
[Bug] or [Feature] Template Used
    ↓
Acceptance Criteria / Reproduction Steps Defined
    ↓
Developer Creates PR
    ↓
PR Template Enforces Quality Checks
    ↓
PR References Issue + Links Related Issues
    ↓
Automated Validation (GitHub Actions)
    ↓
Code Review Against AC
    ↓
✅ Merge to Main / Develop
```

---

## 🎯 Implementation Requirements Met

### ✅ 1. PRs are Checked Against Issue Acceptance Criteria

**How it works:**
- PR template includes section: "Acceptance Criteria Validation"
- PR author must explicitly confirm they've reviewed AC from the issue
- Can document any deviations or unmet criteria with explanations
- Code reviewer verifies AC are actually met before approving

**Files involved:**
- [`.github/pull_request_template.md`](.github/pull_request_template.md) - Main template
- [`.github/workflows/pr-validation.yml`](.github/workflows/pr-validation.yml) - Automated checks

**Example for Feature:**
```markdown
Issue: "Create portfolio feature" (#23)
Acceptance Criteria from issue:
  ✓ User can create portfolio with name
  ✓ Portfolio is associated with authenticated user
  ✓ Response includes portfolio details

PR checklist:
  [x] I have reviewed the issue's acceptance criteria
  [x] All acceptance criteria are met and testable
```

**Example for Bug Fix:**
```markdown
Issue: "Portfolio save button broken" (#78)
Steps to Reproduce (from issue):
  1. Login
  2. Create portfolio
  3. Click save
  4. Refresh page

PR checklist:
  [x] I have reviewed the issue's acceptance criteria
  [x] All acceptance criteria are met and testable
  Note: Fixed the API endpoint call in line 156 of portfolio service
```

---

### ✅ 2. Bug Issues Include Steps to Reproduce

**How it works:**
- Bug report template has dedicated "Steps to Reproduce" section marked as critical
- Includes preconditions (authentication state, data setup)
- Requests environment details (browser, OS, API version)
- Provides template for error messages and logs

**Files involved:**
- [`.github/ISSUE_TEMPLATE/bug_report.md`](.github/ISSUE_TEMPLATE/bug_report.md) - Bug template

**Example bug issue structure:**
```
Title: [BUG] Login page freezes on invalid email

Description: What I did, what I expected, what happened

Steps to Reproduce:
  1. Go to login page
  2. Enter "notanemail" (no @ symbol) in email field
  3. Click login
  4. Observe: Page freezes for 5+ seconds
  5. Expected: Error message appears immediately

Preconditions:
  - [x] User is NOT authenticated
  - [ ] Fresh browser session

Environment:
  Browser: Chrome 120 on Windows 10
  Backend: Local environment
  
Error Messages:
  Console: TypeError: Cannot read property 'email' of undefined
  Network: No response from server
```

---

### ✅ 3. Bugs are Linked to Affected Stories When Relevant

**How it works:**
- Bug template has "Related Issues" section to link to feature stories
- PR template supports linking to both bug and related story issues
- Developers must specify if bug affects existing features
- Automated workflow checks these links during PR validation

**Files involved:**
- [`.github/ISSUE_TEMPLATE/bug_report.md`](.github/ISSUE_TEMPLATE/bug_report.md) - Related issues section
- [`.github/pull_request_template.md`](.github/pull_request_template.md) - Related issues section
- [`.github/workflows/pr-validation.yml`](.github/workflows/pr-validation.yml) - Link validation

**Example linking:**
```
Bug Issue #78: "Portfolio save button not working"
  ↓
Related to Story #45: "User can create and manage portfolios"

When creating PR to fix bug #78:
  Issue Reference: #78 (Bug) and #45 (Story)
  PR title: "Fix portfolio save endpoint - closes #78, relates to #45"
```

---

## 🚀 How to Use

### Creating a Bug Report

1. Go to **Issues → New Issue**
2. Select **"Bug Report"** template
3. Fill out sections in this order:
   ```
   ✓ Bug Description (what's broken)
   ✓ Expected Behavior (what should happen)
   ✓ Actual Behavior (what actually happens)
   ✓ Steps to Reproduce (CRITICAL - numbered steps anyone can follow)
   ✓ Preconditions (authentication state, data setup)
   ✓ Environment (browser, OS, API version)
   ✓ Screenshots/Videos (attach if possible)
   ✓ Related Issues (link to feature story if applicable)
   ✓ Severity & Component tags
   ```

4. Example:
   ```
   **Steps to Reproduce:**
   1. Open browser to https://staging.mpiproject.com
   2. Click "Login" button
   3. Enter email: test@example.com
   4. Enter password: testpass123
   5. Click "Sign in"
   6. Observe: Page shows loading spinner for 30 seconds, then times out
   
   Expected: Login page redirects to dashboard within 3 seconds
   
   **Related Issues:**
   Affects: #45 (User Authentication feature)
   ```

### Creating a Feature Story

1. Go to **Issues → New Issue**
2. Select **"Feature Request / Story"** template
3. Fill out sections:
   ```
   ✓ User Story (As a X, I want Y so that Z)
   ✓ Acceptance Criteria (specific, testable conditions)
   ✓ Implementation Requirements
   ✓ Testing Requirements
   ✓ Definition of Done checklist
   ```

4. Example:
   ```
   **User Story:**
   As a portfolio owner
   I want to see the total value of my portfolio
   So that I understand my investment performance at a glance
   
   **Acceptance Criteria:**
   - [ ] Portfolio shows total value in USD
   - [ ] Value updates when prices change
   - [ ] Calculation includes all holdings
   - [ ] Value displays with 2 decimal places
   - [ ] Error is shown if price data unavailable
   ```

### Creating a Pull Request

1. Create feature branch: `git checkout -b fix/issue-78-portfolio-save`
2. Make your changes and commit
3. Push: `git push origin fix/issue-78-portfolio-save`
4. Go to GitHub → **Create Pull Request**
5. **PR template will auto-populate** - fill it out completely:
   ```
   ✓ Issue Reference: #78 and #45 (if related to story)
   ✓ Issue Type: [x] Bug Fix (or Feature/Chore)
   ✓ Acceptance Criteria Validation: [x] I have reviewed...
   ✓ Testing: Check boxes for tests added
   ✓ Changes Summary: Explain what and why
   ✓ Review Checklist: Check applicable items
   ```

6. Example PR for bug fix:
   ```markdown
   ## Pull Request: Quality Control Checklist
   
   ### 📋 Issue Reference
   - **Closes issue:** #78
   - **Issue Title:** Portfolio save button not working
   - **Issue Type:** [x] Bug Fix
   
   ### ✅ Acceptance Criteria Validation
   [x] I have reviewed the issue's acceptance criteria
   [x] All acceptance criteria are met and testable
   
   **Issue AC (from #78):**
   1. User can create portfolio - ✓ Verified
   2. Portfolio saves on button click - ✓ Fixed endpoint
   3. Save completes within 2 seconds - ✓ Tested
   
   ### 🔗 Related Issues & Stories
   - Affects: #45 (Portfolio Management feature)
   - Bug has steps to reproduce: ✓ Yes (#78 has detailed steps)
   
   ### 🧪 Testing
   [x] Unit tests added/updated
   [x] Integration tests added/updated
   - Added test: `test_portfolio_save_endpoint.py`
   - Verified: Save completes in <500ms
   
   ### 📝 Changes Summary
   Fixed API endpoint call in `backend/api/routes/portfolio.py` line 156.
   Changed `PUT` to `POST` on `/portfolios/{id}/save` endpoint.
   ```

---

## 🔍 Code Review Checklist

**Before approving a PR, reviewers must verify:**

### For Feature PRs:
- [ ] Issue has clear acceptance criteria
- [ ] All AC are implemented and testable
- [ ] Tests cover all AC
- [ ] No breaking changes
- [ ] Documentation updated

### For Bug Fix PRs:
- [ ] Bug issue has steps to reproduce
- [ ] Steps are clear and anyone could follow them
- [ ] Bug is fixed with the provided steps
- [ ] Related feature story is referenced
- [ ] Regression tests added to prevent reoccurrence

### For All PRs:
- [ ] Follows code style guidelines
- [ ] No merge conflicts
- [ ] Tests passing locally and in CI/CD
- [ ] Related issues properly linked
- [ ] PR template completely filled out

**Example Review Comment:**
```markdown
✅ This PR looks good! 

- Verified that all 3 acceptance criteria from #45 are met
- Bug reproduction steps from #78 work correctly with this fix
- Tests cover the new endpoint
- Story #45 status can be updated to "In Testing"

Approved for merge 👍
```

---

## 🔄 Workflow: Bug Found in Production

### Scenario: User can't save portfolio changes

**Step 1: Create Bug Issue** (QA or user reports)
```
Title: [BUG] Portfolio changes not saving in production
Steps to Reproduce: (detailed)
Severity: Critical
Affects: #45 (Portfolio Management)
```

**Step 2: Developer Creates Fix PR**
```
PR Title: Fix portfolio save - closes #78, relates to #45
PR Links: Both #78 and #45
PR mentions AC from #45 that should still pass
```

**Step 3: Reviewer Checks**
```
✓ Does fix solve bug #78 with provided steps?
✓ Does it maintain AC from story #45?
✓ Are tests included?
✓ Does it reference both issues?
```

**Step 4: Merge & Deploy**
```
✓ PR approved
✓ Tests passing
✓ Issues linked for traceability
✓ Can tag PR and release notes with both #78 and #45
```

---

## 📈 Release Notes Template

When releasing, use linked issues to generate notes:

```markdown
## Release v1.2.0

### ✨ Features
- #45: User can create and manage portfolios
- #52: Portfolio valuation dashboard

### 🐛 Bug Fixes
- #78: Portfolio save endpoint not responding (affects #45)
- #81: Login timeout on slow networks (affects #23)

### 📋 Issues Closed
- #78 (linked to #45)
- #81 (linked to #23)
```

---

## ⚙️ Automated Validation

Our GitHub Actions workflow (`pr-validation.yml`) automatically checks:

1. **PR References Issue:** ✓ PR must reference at least one issue
2. **Template Used:** ✓ PR must use the template
3. **Acceptance Criteria:** ✓ AC section must be filled
4. **Test Coverage:** ✓ Tests must be claimed added/updated
5. **Issue Linking:** ✓ Bug fixes must link to bug issue

**If checks fail:**
- Workflow posts comment on PR
- Links to documentation
- Asks for required items

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| [`.github/pull_request_template.md`](.github/pull_request_template.md) | PR template with acceptance criteria validation |
| [`.github/ISSUE_TEMPLATE/bug_report.md`](.github/ISSUE_TEMPLATE/bug_report.md) | Bug template with steps to reproduce + linking |
| [`.github/ISSUE_TEMPLATE/feature_request.md`](.github/ISSUE_TEMPLATE/feature_request.md) | Feature template with acceptance criteria |
| [`.github/ISSUE_TEMPLATE/config.yml`](.github/ISSUE_TEMPLATE/config.yml) | Issue template configuration |
| [`.github/workflows/pr-validation.yml`](.github/workflows/pr-validation.yml) | Automated PR quality checks |
| [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) | Contribution guidelines |
| [`QUALITY_CONTROL.md`](./QUALITY_CONTROL.md) | This file - complete QC process guide |

---

## ✅ Benefits of This System

1. **Traceability:** Every PR links to issues, issues link to related features
2. **Quality:** PRs must validate against issue AC before merge
3. **Clarity:** Bugs always have reproducible steps, not vague reports
4. **Impact Analysis:** Bugs linked to features for release impact assessment
5. **Automation:** GitHub Actions enforce checklist items
6. **Learning:** Team learns from well-documented issues and PRs

---

## 🎓 Best Practices

### Writing Good Acceptance Criteria
✅ **Good:** "User can create portfolio with name (1-100 chars), description optional"
❌ **Bad:** "User can create portfolio"

✅ **Good:** "Validation error appears within 1 second if email invalid"
❌ **Bad:** "Email validation works"

### Writing Good Reproduction Steps
✅ **Good:**
```
1. Go to https://app.mpiproject.com
2. Click "Logout" if already logged in
3. Enter "test@example.com" in email field
4. Enter "password123" in password field
5. Click "Sign In"
6. Observe: Page shows "Network Timeout" after 45 seconds
```

❌ **Bad:**
```
"Login doesn't work sometimes"
```

### Linking Issues Properly
✅ **Good:** PR says "Fixes #78 (bug) which affects #45 (feature story)"
❌ **Bad:** PR doesn't mention why the bug was created or what it affects

---

## 📞 Support

Questions about this QC process?
- Review examples in this document
- Check closed PRs for well-documented patterns
- Ask the QA Engineer (team lead) for guidance

---

**Last Updated:** 2026-04-25
**Version:** 1.0
**Maintained by:** Quality Assurance Team
