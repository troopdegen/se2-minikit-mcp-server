# GitHub Projects Board Setup Guide

**Version**: 1.0
**Last Updated**: 2025-11-06

This guide provides step-by-step instructions for setting up a GitHub Projects board to track implementation of the SE2-Minikit MCP Server.

## Table of Contents

- [Quick Start](#quick-start)
- [Board Configuration](#board-configuration)
- [Views and Filters](#views-and-filters)
- [Automation Rules](#automation-rules)
- [Labels and Tags](#labels-and-tags)
- [Issue Creation](#issue-creation)
- [Team Workflow](#team-workflow)
- [Metrics and Reporting](#metrics-and-reporting)

---

## Quick Start

### Prerequisites

- GitHub repository created
- Admin access to the repository
- Issues enabled on the repository

### Initial Setup (5 minutes)

1. **Navigate to Projects**: Repository → Projects → New Project
2. **Choose Template**: Select "Board" template
3. **Name**: "SE2-Minikit Implementation"
4. **Visibility**: Public (or Private if internal)
5. **Create Project**

---

## Board Configuration

### 1. Column Setup

Create the following columns (in order):

#### Column 1: **📋 Backlog**
- **Description**: Issues not yet ready to start
- **Status**: Backlog
- **Sort**: Priority (p0 first)

#### Column 2: **✅ Ready**
- **Description**: Issues with all dependencies met, ready to be picked up
- **Status**: Ready
- **Sort**: Priority → Complexity

#### Column 3: **🔄 In Progress**
- **Description**: Actively being worked on
- **Status**: In Progress
- **Sort**: Assignee
- **Limit**: 5-7 issues (prevent over-commitment)

#### Column 4: **👀 In Review**
- **Description**: Pull request opened, awaiting review
- **Status**: In Review
- **Sort**: Age (oldest first)

#### Column 5: **✅ Done**
- **Description**: Merged and tested
- **Status**: Done
- **Sort**: Completion date (newest first)

### 2. Custom Fields

Add these custom fields to track additional metadata:

#### Epic Field
- **Type**: Single Select
- **Options**:
  - Epic 1: Core Infrastructure
  - Epic 2: Scaffold & Configuration
  - Epic 3: Minikit Integration
  - Epic 4: Deployment Pipeline
  - Epic 5: Polish & Testing
  - Epic 6: Launch

#### Complexity Field
- **Type**: Single Select
- **Options**:
  - Low (1-3 points)
  - Medium (5-8 points)
  - High (13+ points)

#### Story Points Field
- **Type**: Number
- **Options**: 1, 2, 3, 5, 8, 13, 21

#### Domain Field
- **Type**: Multiple Select
- **Options**:
  - Backend
  - Frontend
  - Contracts
  - Templates
  - Documentation
  - Testing
  - Infrastructure

#### Blocked By Field
- **Type**: Text
- **Description**: Issue numbers that block this issue (e.g., "#11, #12")

#### Blocked Status Field
- **Type**: Single Select
- **Options**:
  - Not Blocked
  - Blocked (dependency)
  - Blocked (waiting for info)
  - Blocked (external)

---

## Views and Filters

### View 1: **All Issues (Default)**
- **Type**: Board
- **Columns**: Backlog, Ready, In Progress, Review, Done
- **Filter**: None
- **Sort**: Priority, then Age

### View 2: **Epic Progress**
- **Type**: Table
- **Columns**: Title, Epic, Status, Assignee, Story Points
- **Group By**: Epic
- **Filter**: None
- **Purpose**: See progress across epics

### View 3: **Available Work**
- **Type**: Board
- **Columns**: Ready only
- **Filter**:
  - Status: Ready
  - No assignee
  - Priority: p0, p1, p2
- **Sort**: Priority, then Complexity
- **Purpose**: Help developers find work

### View 4: **Blocked Issues**
- **Type**: Table
- **Columns**: Title, Blocked Status, Blocked By, Assignee
- **Filter**: Blocked Status ≠ "Not Blocked"
- **Sort**: Priority
- **Purpose**: Identify and resolve blockers quickly

### View 5: **Sprint View (Weekly)**
- **Type**: Board
- **Columns**: In Progress, Review
- **Filter**:
  - Status: In Progress OR In Review
  - Updated within: 7 days
- **Purpose**: Focus on active work in current sprint

### View 6: **Burndown (Epic)**
- **Type**: Chart (Roadmap)
- **X-axis**: Time
- **Y-axis**: Story Points
- **Group By**: Epic
- **Purpose**: Track epic completion over time

### View 7: **Team Workload**
- **Type**: Table
- **Columns**: Assignee, Count, Total Story Points
- **Group By**: Assignee
- **Filter**: Status: In Progress OR In Review
- **Purpose**: Balance workload across team

---

## Automation Rules

### Rule 1: Auto-Move to In Progress
- **Trigger**: Issue assigned
- **Condition**: Status = Ready OR Backlog
- **Action**: Set Status to "In Progress"

### Rule 2: Auto-Move to In Review
- **Trigger**: Pull request opened
- **Condition**: Links to issue
- **Action**: Set Status to "In Review"

### Rule 3: Auto-Move to Done
- **Trigger**: Pull request merged
- **Condition**: Status = In Review
- **Action**:
  - Set Status to "Done"
  - Add comment: "PR merged, issue complete! 🎉"

### Rule 4: Auto-Add Epic Label
- **Trigger**: Issue created with title starting with "#1-#10"
- **Condition**: Title matches pattern `#[1-10]:`
- **Action**: Add label "epic-1-infrastructure"
- **Note**: Create similar rules for #11-18, #19-24, #25-34, #35-40, #41-44

### Rule 5: Auto-Notify on Blocking
- **Trigger**: Issue marked as blocked
- **Condition**: Blocked Status changed to "Blocked (dependency)"
- **Action**:
  - Add label "blocked"
  - Notify project maintainer
  - Comment: "⚠️ Issue blocked. See 'Blocked By' field for dependencies."

### Rule 6: Auto-Remove Assignee on Blocked
- **Trigger**: Issue marked as blocked
- **Condition**: Blocked Status ≠ "Not Blocked"
- **Action**:
  - Move to "Backlog"
  - Add comment: "Moved to backlog due to blocker. Will auto-assign when unblocked."

### Rule 7: Stale PR Alert
- **Trigger**: Scheduled (daily)
- **Condition**: Status = "In Review" AND Updated > 2 days ago
- **Action**:
  - Add comment: "⏰ This PR has been in review for 2+ days. Please review or request changes."
  - Notify reviewers

### Rule 8: Epic Completion Celebration
- **Trigger**: All issues in epic closed
- **Condition**: Count of open issues with epic label = 0
- **Action**:
  - Create celebratory comment
  - Notify team
  - Update project README

---

## Labels and Tags

### Priority Labels
- `p0-critical` 🔴 - Blocking issues, security vulnerabilities (Red)
- `p1-high` 🟠 - Important features, major bugs (Orange)
- `p2-medium` 🟡 - Standard features, minor bugs (Yellow)
- `p3-low` 🟢 - Nice-to-have features, cosmetic issues (Green)

### Type Labels
- `feature` - New functionality (Blue)
- `bug` - Something isn't working (Red)
- `docs` - Documentation improvements (Purple)
- `refactor` - Code quality improvements (Gray)
- `test` - Testing improvements (Yellow)
- `chore` - Maintenance tasks (Gray)

### Domain Labels
- `backend` - Server-side code (Blue)
- `frontend` - Client-side code (Cyan)
- `contracts` - Smart contracts (Purple)
- `templates` - Project templates (Pink)
- `infrastructure` - Build, CI/CD, tooling (Gray)

### Status Labels
- `blocked` - Cannot proceed due to dependency (Red)
- `needs-info` - Waiting for more information (Yellow)
- `needs-review` - PR awaiting review (Orange)
- `good-first-issue` - Beginner-friendly (Green)
- `help-wanted` - Extra attention needed (Blue)

### Epic Labels
- `epic-1-infrastructure` (Week 1-2)
- `epic-2-scaffold` (Week 3-4)
- `epic-3-minikit` (Week 5-6)
- `epic-4-deployment` (Week 7-8)
- `epic-5-polish` (Week 9-10)
- `epic-6-launch` (Week 11-12)

### Complexity Labels
- `complexity-low` - 1-3 story points (Green)
- `complexity-medium` - 5-8 story points (Yellow)
- `complexity-high` - 13+ story points (Red)

---

## Issue Creation

### Step 1: Create Epic Milestones

Create 6 milestones for the epics:

```
Milestone 1: Epic 1 - Core Infrastructure
Due: Week 2
Description: Foundational MCP server architecture and template system

Milestone 2: Epic 2 - Scaffold & Configuration
Due: Week 4
Description: Project scaffolding and contract configuration tools

Milestone 3: Epic 3 - Minikit Integration
Due: Week 6
Description: Base Minikit and Farcaster integration features

Milestone 4: Epic 4 - Deployment Pipeline
Due: Week 8
Description: Contract deployment with verification and configuration

Milestone 5: Epic 5 - Polish & Testing
Due: Week 10
Description: Comprehensive testing, documentation, and user experience refinement

Milestone 6: Epic 6 - Launch
Due: Week 12
Description: Production deployment, marketing, and post-launch support
```

### Step 2: Bulk Create Issues from WORKFLOW.md

For each of the 44 issues in [WORKFLOW.md](./WORKFLOW.md):

1. **Use Feature Template** for implementation tasks
2. **Fill Required Fields**:
   - Title: `[#N] Issue Title` (e.g., `[#1] Project Initialization & Setup`)
   - Epic: Select from dropdown
   - Priority: As specified in WORKFLOW.md
   - Complexity: As specified in WORKFLOW.md
   - Story Points: As specified in WORKFLOW.md
   - Domains: Check applicable boxes
   - Description: Copy from WORKFLOW.md
   - Tasks: Copy checklist from WORKFLOW.md
   - Acceptance Criteria: Copy from WORKFLOW.md
   - Dependencies: Link related issues (e.g., "Depends on #11, #12")

3. **Assign to Milestone**: Select appropriate Epic milestone
4. **Add Labels**: Priority, complexity, domain, epic

### Step 3: Link Dependencies

After creating all issues:

1. Edit each issue's "Blocked By" field
2. Add blocking issue numbers (e.g., "#11, #12")
3. Cross-reference in comments (e.g., "Blocked by #11")

### Automation Script (Optional)

Create issues programmatically:

```bash
# Using GitHub CLI
gh issue create \
  --title "[#1] Project Initialization & Setup" \
  --body-file .github/issue-templates/issue-1.md \
  --label "feature,p0-critical,complexity-low,epic-1-infrastructure,backend,infrastructure" \
  --milestone "Epic 1 - Core Infrastructure" \
  --assignee ""
```

---

## Team Workflow

### For Developers

#### Finding Work

1. **Open "Available Work" View**
2. **Filter by Your Skills**:
   - Backend: Filter by `backend` label
   - Frontend: Filter by `frontend` label
   - Contracts: Filter by `contracts` label
3. **Check Dependencies**: Ensure "Blocked By" field is empty
4. **Claim Issue**: Comment "I'd like to work on this"
5. **Wait for Assignment**: Maintainer assigns issue to you

#### Working on Issue

1. **Issue Auto-Moves to "In Progress"** when assigned
2. **Create Branch**: `feature/<issue-number>-<description>`
3. **Update Issue**: Add comments on progress
4. **Open PR**: Reference issue with "Closes #N"
5. **Issue Auto-Moves to "In Review"** when PR opens

#### After Merge

1. **Issue Auto-Moves to "Done"** when PR merges
2. **Celebrate!** 🎉
3. **Pick Next Issue** from "Available Work"

### For Maintainers

#### Daily Tasks

1. **Review "Blocked Issues" View**: Resolve blockers
2. **Check "In Review" Column**: Review PRs within 24 hours
3. **Update "Ready" Column**: Move issues from Backlog as dependencies clear
4. **Monitor Workload**: Check "Team Workload" view for balance

#### Weekly Tasks

1. **Epic Progress Review**: Check "Epic Progress" view
2. **Adjust Priorities**: Re-prioritize based on blockers and progress
3. **Team Sync**: Share "Sprint View" in weekly meeting
4. **Update Documentation**: Document decisions and learnings

#### Sprint Planning

1. **Review Burndown Chart**: Assess velocity
2. **Plan Next Sprint**: Move issues to "Ready"
3. **Assign Work**: Based on team capacity and skills
4. **Set Sprint Goals**: Communicate targets

---

## Metrics and Reporting

### Key Metrics to Track

#### Velocity Metrics
- **Story Points Completed Per Week**: Target 30-40 points/week (2-3 devs)
- **Epic Completion Rate**: % of epics on schedule
- **Cycle Time**: Average days from "In Progress" to "Done"

#### Quality Metrics
- **Bug Rate**: Bugs per 100 story points
- **PR Review Time**: Average hours to first review
- **Merge Time**: Average days from PR open to merge

#### Team Metrics
- **Workload Balance**: Story points per developer
- **Blocked Issue Count**: Target <5% of total issues
- **Stale PR Count**: PRs in review >2 days

### Generating Reports

#### Weekly Status Report

```
Epic Progress:
- Epic 1 (Core Infrastructure): 80% complete (8/10 issues)
- Epic 2 (Scaffold & Config): 25% complete (2/8 issues)

Velocity:
- Story Points Completed: 35 (target: 30-40)
- Issues Closed: 10
- PRs Merged: 8

Blockers:
- Issue #11 blocked by #3 (in review)
- Issue #19 waiting on #11

Next Week Focus:
- Complete Epic 1 (#9, #10)
- Start Epic 2 (#11, #12)
```

#### Monthly Milestone Report

```
Milestone: Epic 2 - Scaffold & Configuration
Status: On Track (75% complete)

Completed:
- #11: Scaffold Project Tool
- #12: Network Manager
- #13: Contract Templates
- #14: Configure Contracts Tool
- #15: Validator Engine
- #16: Validate Configuration Tool

In Progress:
- #17: Environment Variable Management
- #18: E2E Tests for Scaffolding

Next Milestone: Epic 3 (Minikit Integration)
Start Date: Week 5
```

### Dashboard Widgets

Add these widgets to project overview:

1. **Epic Progress Bar Chart**
   - X-axis: Epics
   - Y-axis: % Complete
   - Color: Green (>75%), Yellow (50-75%), Red (<50%)

2. **Burndown Chart**
   - X-axis: Weeks
   - Y-axis: Remaining Story Points
   - Target Line: Ideal burndown rate

3. **Blocked Issues List**
   - Shows title, blocked by, age
   - Sorted by priority

4. **Team Workload Table**
   - Columns: Developer, Active Issues, Total Points
   - Alerts on overload (>20 points)

5. **PR Review Queue**
   - Shows PRs in review
   - Age indicator (red if >2 days)

---

## Best Practices

### Issue Management

✅ **Do**:
- Keep issues small and focused (5-8 points ideal)
- Update status regularly
- Link dependencies explicitly
- Use clear acceptance criteria
- Add comments on progress

❌ **Don't**:
- Create mega-issues (split into smaller tasks)
- Leave issues unassigned for >2 days
- Forget to update blocked status
- Skip acceptance criteria
- Let PRs go stale (>2 days in review)

### Board Hygiene

✅ **Do**:
- Archive done issues after 2 weeks
- Review blocked issues daily
- Keep "In Progress" limited (5-7 items)
- Update custom fields consistently
- Use views to focus workflow

❌ **Don't**:
- Let backlog grow unbounded
- Ignore blocked issues
- Overload "In Progress" column
- Forget to link PRs to issues
- Create duplicate issues

### Team Collaboration

✅ **Do**:
- Comment on progress regularly
- Tag teammates for help
- Celebrate completed epics
- Share blockers early
- Request reviews promptly

❌ **Don't**:
- Work in silence (update issues!)
- Hoard knowledge
- Let blockers linger
- Rush PRs without tests
- Skip code reviews

---

## Troubleshooting

### Issue Not Moving to "In Progress"

**Problem**: Assigned issue stays in "Backlog"
**Solution**:
1. Check automation rules are enabled
2. Manually drag to "In Progress"
3. Verify issue status field is set

### Automation Not Firing

**Problem**: PR merged but issue not moving to "Done"
**Solution**:
1. Check PR properly references issue ("Closes #N")
2. Verify automation enabled for repository
3. Manually close issue and document why automation failed

### Too Many Blocked Issues

**Problem**: >10% of issues blocked
**Solution**:
1. Review dependency chains in [DEPENDENCIES.md](./DEPENDENCIES.md)
2. Prioritize unblocking issues
3. Consider splitting large blocking issues
4. Reassign developers to critical path

### Unbalanced Workload

**Problem**: One developer has 3x more points than others
**Solution**:
1. Review "Team Workload" view
2. Reassign issues
3. Pair programming on complex issues
4. Consider bringing in additional help

---

## Advanced Configuration

### GitHub Actions Integration

Automate board updates with workflows:

```yaml
# .github/workflows/project-board.yml
name: Update Project Board

on:
  issues:
    types: [opened, closed, assigned]
  pull_request:
    types: [opened, closed, merged]

jobs:
  update-board:
    runs-on: ubuntu-latest
    steps:
      - name: Update Project
        uses: actions/add-to-project@v0.5.0
        with:
          project-url: https://github.com/orgs/<org>/projects/<id>
          github-token: ${{ secrets.PROJECT_TOKEN }}
```

### Custom Automation with GitHub API

```javascript
// Update blocked status based on dependency completion
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function checkBlockers(issueNumber) {
  const issue = await octokit.issues.get({
    owner: "org",
    repo: "se2-minikit-mcp-server",
    issue_number: issueNumber
  });

  const blockedBy = issue.data.body.match(/Depends on #(\d+)/g);

  if (blockedBy) {
    // Check if blocking issues are closed
    // Update blocked status accordingly
  }
}
```

---

## Maintenance

### Weekly Review Checklist

- [ ] Archive completed issues (>2 weeks old)
- [ ] Update epic progress in README
- [ ] Review and resolve blocked issues
- [ ] Check for stale PRs (>2 days)
- [ ] Balance team workload
- [ ] Update milestone dates if needed
- [ ] Generate weekly status report

### Monthly Review Checklist

- [ ] Analyze velocity trends
- [ ] Review complexity estimates vs actuals
- [ ] Update WORKFLOW.md if scope changes
- [ ] Assess automation effectiveness
- [ ] Gather team feedback on board
- [ ] Optimize views based on usage
- [ ] Plan next month's focus areas

---

## Resources

- **WORKFLOW.md**: Full issue breakdown and dependencies
- **DEPENDENCIES.md**: Visual dependency mapping
- **CONTRIBUTING.md**: Contribution guidelines and workflow
- **GitHub Projects Docs**: https://docs.github.com/en/issues/planning-and-tracking-with-projects

---

## Support

Questions about the project board setup?

- **GitHub Discussions**: Ask in Q&A section
- **Team Lead**: Contact project maintainer
- **Documentation**: Refer to GitHub Projects docs

---

**Last Updated**: 2025-11-06
**Maintained By**: Project Lead
**Next Review**: Weekly during active development
