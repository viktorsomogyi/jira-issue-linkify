/*
 * Copyright 2018 Viktor Somogyi-Vass
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.get(['defaultUrl', 'defaultRegex', 'projects'], function(result) {
    if (result.defaultUrl === undefined || result.defaultUrl === null) {
      chrome.storage.sync.set({defaultUrl: 'https://issues.apache.org/jira/browse/'}, function() {
        console.log('Setting initial JIRA URL')
      });
    }
    if (result.defaultRegex === undefined || result.defaultRegex === null) {
      chrome.storage.sync.set({defaultRegex: '[A-Z]{2,20}-\\d{1,7}'}, function() {
        console.log('Setting initial regex')
      });
    }
    if (result.projects === undefined || result.projects === null) {
      chrome.storage.sync.set({projects: []}, function() {
        console.log('Setting initial empty project list')
      });
    }
  });
});
