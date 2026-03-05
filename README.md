# Autofill

The following extension is used to assist with consistent inclusiong of PM Manager and Site/Lead Manager CC's.

## Overview

The extension reads the location provided on a user's Giva profile. Then fills in the assigned managers into the
customer CC box. Currently all practices/groups are supported, excluding corporate offices Palm and Shaw.

## Implementation Notes

The extension uses the following Chrome APIs:

- `insertCustomerCC()` - Injects user values into the customer CC portion on giva

The Giva Autofill Cusomter CC can be toggled by:

- Clicking the extension icon


## Running this extension

1. Load this directory in Chrome as an [unpacked extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked).
2. Navigate to https://developer.chrome.com/docs/extensions/ or https://developer.chrome.com/docs/webstore/.
3. Click the extension icon to toggle the autofill.
