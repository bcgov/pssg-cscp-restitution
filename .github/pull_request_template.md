## What this changes
<!-- A line or two, in plain words. -->


## Jira
<!-- The ticket's link. -->


## How it was tested
<!-- What you ran or clicked, and where: on your machine, in dev, in test. -->


## Before review
- [ ] It builds with `docker build` locally.
- [ ] If `.github/checks.yml` lists folders, their lint and tests pass.
- [ ] ci's comment shows no new fixable HIGH or CRITICAL, no new CodeQL alert, and Sonar's gate passed.
- [ ] Each package added or upgraded is named above, with why, and its lock file is in this pull request.
- [ ] A database change is in this pull request as a script or migration, and says whether it can be undone.

## Does DevOps need to do anything outside the code?
<!-- Tick Yes and say what above when it needs: a new or changed setting or secret, and in which environments;
     a new service, route or volume; a database change run in test and prod; or anything else on the cluster
     or in GitHub. DevOps reaches out. Tick one. -->
- [ ] No
- [ ] Yes
