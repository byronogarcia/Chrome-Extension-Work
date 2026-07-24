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

1. Open up Google Chrome Browser.
2. Navigate to Extensions -> Manage Extensions or enter chrome://extensions in a new tab.
3. Enable Developer Mode by clicking the toggle switch next to Developer mode.
4. Click the Load unpacked button and select the extension directory.
5. Path: X:\Technicians\Tools\Chrome\Extensions
6. Pin your extension to the toolbar to quickly access your extension during development. Extensions -> Pin
7. Click the extension icon to toggle the autofill.
8. Alternatively, navigate to Extensions -> Keyboard Shortcuts 
9. Set the keyboard shortcut on the Giva CC Autofill extension to: Ctrl + Shift + F
10. Now, you can run the extension by clicking the icon OR using the shortcut Ctrl + Shift + F

## Goals for extension from here

- Include offices Palm and Shaw, additional logic needed as there are 17-20 managers broken down by dept and individual user
- Possibly auto-run when opening a new ticket and allow for click to run on already created tickets
- Provide warning if the giva session is expired/visual cue

## New Features
- Will not include Manager CC if the Manager is the Customer
- Can use keyboard shortcut 'Ctrl+Shift+F' to trigger the shortcut
- 3 second visual cue of a successful auto-fill