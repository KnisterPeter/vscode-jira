# vscode-jira README

[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/knisterpeter.vscode-jira.svg)](https://marketplace.visualstudio.com/items?itemName=KnisterPeter.vscode-jira)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/knisterpeter.vscode-jira.svg)](https://marketplace.visualstudio.com/items?itemName=KnisterPeter.vscode-jira)

This vscode extension integrates with JIRA.

# Features

* Provide links to JIRA from source code comments
* Browse issues assigned to you
* Track activate issue
* Transition active issue (update workflow)
* Add comments to active issue

# Usage

Store your project setup in `.vscode/settings.json` and add the keys `jira.baseUrl` and `jira.projectNames`.

Then setup your credentials first by running `Setup credentials...` command.

# Configuration

Based on the `jira.projectNames` settings this extensions scans the open file in code
and searches for '`#<project-name>-1234`' mentions. These occurences will then be linked to
your JIRA issues.

If you need to search for more than one JIRA project you can add multiple project names
by separating via comma.

For example to connect to this JIRA instance [VSJT](https://knisterpeter.atlassian.net/projects/VSJT)
add `"jira.projectNames": "VSJT"` to your settings.
Then you can add a comment like this '`// #VSJT-1`' in your file to reference an issue.

# Resources

Based on [JIRA APIs](https://docs.atlassian.com/jira/REST/)
