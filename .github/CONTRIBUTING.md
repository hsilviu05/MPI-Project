# Contributing to MPI-Project

Thank you for contributing! This document outlines our quality control process to ensure release quality is maintained.

## Quality Control Process

### 1️⃣ Creating Issues

#### For Bug Reports
1. Use the **Bug Report** issue template
2. **REQUIRED:** Include detailed **Steps to Reproduce**
3. **REQUIRED:** List preconditions (authentication state, data setup, etc.)
4. If the bug affects an existing feature story, link it in the **Related Issues** section
5. Tag with severity: Critical, High, Medium, or Low

#### For Feature Requests / Stories
1. Use the **Feature Request** issue template
2. **REQUIRED:** Define clear, testable **Acceptance Criteria**
3. Specify implementation requirements for backend, frontend, and devops
4. Link blocking/blocked-by issues
5. Define testing requirements

### 2️⃣ Creating Pull Requests

#### Before Creating a PR
1. Ensure the issue you're addressing has:
   - Clear acceptance criteria (for features) or reproduction steps (for bugs)
   - Proper labels and assignment
2. Create a feature branch from `main` or `develop`: `git checkout -b feature/issue-number-description`

#### When Creating a PR
1. **Use the PR template** - it will appear automatically
2. **Link the issue:** Reference it in "Issue Reference" section
3. **Validate acceptance criteria:** Check off that you've reviewed them
4. **Link related issues:** If fixing a bug that affects a story, reference it
5. **Document tests:** List what tests were added/updated
6. **Follow the checklist:** Complete all applicable items

#### PR Acceptance Requirements
Your PR must meet these criteria to be merged:

- ✅ References the original issue(s)
- ✅ Fulfills ALL acceptance criteria from the issue
- ✅ Includes tests (unit, integration, or E2E)
- ✅ Passes all automated checks (CI/CD pipelines)
- ✅ Approved by at least one reviewer
- ✅ No merge conflicts

### 3️⃣ Code Review Process

During review, we verify:

1. **Acceptance Criteria Met:** Does the PR fulfill all AC from the issue?
2. **Test Coverage:** Are tests included and do they pass?
3. **Code Quality:** Does it follow project standards?
4. **Related Issues:** For bugs, are affected stories updated?
5. **Documentation:** Is documentation updated if needed?

## Issue Templates Reference

### Bug Report Template Sections
- **Bug Description:** What's broken and how is it different from expected behavior?
- **Steps to Reproduce:** Critical section - numbered steps that anyone can follow
- **Environment:** Browser, OS, API version, etc.
- **Related Issues:** Link to feature stories affected by this bug
- **Acceptance Criteria for Fix:** How we know the bug is fixed

### Feature Request Template Sections
- **User Story:** "As a X, I want Y so that Z"
- **Acceptance Criteria:** What must be true for the feature to be complete
- **Implementation Requirements:** Backend/frontend/devops specifics
- **Testing Requirements:** What needs to be tested
- **Definition of Done:** Checklist for feature completion

## Linking Bugs to Stories

**When should a bug be linked to a story?**
- If the bug occurs in newly implemented feature
- If the bug is a regression from a recent change
- If fixing the bug requires changes to a related feature story

**How to link:**
1. In the bug issue, add the story issue number in "Related Issues"
2. When creating a PR for the bug fix, reference both issues
3. In PR description, explain how the bug impacts the story

## Example Workflow

### Scenario: Frontend Button Not Saving Portfolio

1. **Create Bug Issue:**
   - Title: `[BUG] Portfolio save button not persisting changes`
   - Include steps: "1. Login 2. Create portfolio 3. Click save 4. Refresh page"
   - Link to story: "Create Portfolio" feature (#45)
   - Severity: High

2. **Create PR to fix:**
   - Title: `Fix portfolio save endpoint call - closes #78`
   - Reference issue: `#78 (Bug) and #45 (Feature)`
   - Add test to verify save works
   - PR template validates all AC from issue

3. **Review & Merge:**
   - Reviewer confirms bug steps are fixed
   - Confirms tests pass
   - Ensures story #45 acceptance criteria still met
   - Approves and merges

## Continuous Integration

Our automated workflows check:
- ✅ PR references an issue
- ✅ PR template is properly completed
- ✅ Tests are included or documented
- ✅ Backend CI passes (Python tests, style checks)
- ✅ E2E tests pass (Playwright tests)
- ✅ Build succeeds for both backend and frontend

If any check fails, please address it before requesting review.

## Release Quality Standards

We maintain release quality through:

1. **Issue Acceptance Criteria:** Features must have clear, testable criteria
2. **Comprehensive Testing:** All changes must include appropriate tests
3. **Bug Documentation:** All bugs must have reproduction steps
4. **Issue Linking:** Bugs are linked to affected feature stories
5. **PR Validation:** All PRs validated against acceptance criteria before merge

## Questions?

- Review our [QA Scenarios](../QA_SCENARIOS.md) for feature examples
- Check the [README](../README.md) for architecture and setup
- Look at merged PRs for examples of well-documented changes

---

**Thank you for helping us maintain quality!** 🚀
