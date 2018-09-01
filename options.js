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

function loadData() {
  chrome.storage.sync.get(['defaultUrl', 'defaultRegex', 'projects'], function(result) {
    var defaultJiraUrl = document.getElementById('defaultJiraUrl');
    defaultJiraUrl.value = result.defaultUrl;
    var defaultRegex = document.getElementById('defaultRegex');
    defaultRegex.value = result.defaultRegex;
    if (result.projects !== null && result.projects !== undefined) {
      var projects = document.getElementById('projects');
      for (var [k, v] of result.projects) {
        var row = addRow();
        row.childNodes[1].value = k;
        row.childNodes[3].value = v;
      }
    }
  });
}

function addRow() {
  var row = document.createElement('div');
  row.className = uuid();
  var projectLabel = document.createElement('span');
  projectLabel.textContent = 'Project\'s name:';
  var project = document.createElement('input');
  project.type = 'text';
  var urlLabel = document.createElement('span');
  urlLabel.textContent = 'Browse URL:';
  var browseUrl = document.createElement('input');
  browseUrl.type = 'text';
  var removeBtn = document.createElement('input');
  removeBtn.type = 'button';
  removeBtn.value = 'Remove';
  removeBtn.addEventListener('click', function() {
    remove(row);
  })
  row.appendChild(projectLabel);
  row.appendChild(project);
  row.appendChild(urlLabel);
  row.appendChild(browseUrl);
  row.appendChild(removeBtn);
  var projects = document.getElementById('projects');
  projects.appendChild(row);
  return row;
}

function remove(rowDiv) {
  console.log(rowDiv.children[1].value);
  var parent = rowDiv.parentNode;
  parent.removeChild(rowDiv);
  saveProjectUrls();
}

function uuid() {
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var result = "";
  for (var i = 0; i < 10; ++i) {
    var rand = Math.floor(Math.random() * chars.length);
    result = result.concat(chars.charAt(rand));
  }
  return result;
}

function save() {
  var projects = document.getElementById('projects');
  saveDefaultUrl();
  saveDefaultRegex();
  saveProjectUrls();
}

function saveDefaultUrl() {
  var defaultJiraUrl = document.getElementById('defaultJiraUrl');
  chrome.storage.sync.set({defaultUrl: defaultJiraUrl.value}, function() {
    console.log('Default JIRA URL is ' + defaultJiraUrl.value);
  });
}

function saveDefaultRegex() {
  var defaultRegex = document.getElementById('defaultRegex');
  var fallback = defaultRegex.value;
  chrome.storage.sync.set({defaultRegex: defaultRegex.value}, function() {
    console.log('Default project regex is ' + defaultRegex.value);
  });
}

function saveProjectUrls() {
  var projectsDiv = document.getElementById('projects');
  if (projectsDiv.hasChildNodes()) {
    var children = projectsDiv.children;
    var projectsArray = [];
    for (var i = 0; i < children.length; ++i) {
      var currentChild = children[i];
      projectsArray.push([currentChild.children[1].value, currentChild.children[3].value]);
    }
  }
  chrome.storage.sync.set({projects: projectsArray}, function() {
    console.log('Saved project URLs ' + JSON.stringify(projectsArray));
  });
}

var saveBtn = document.getElementById('saveButton');
saveBtn.addEventListener('click', function() {
  save();
});

var addRowBtn = document.getElementById('addRowButton');
addRowBtn.addEventListener('click', function() {
  addRow();
});

loadData();