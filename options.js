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

$(function() {
  var $projectRowTemplate = $(
    `
    <div class="field is-horizontal projectRow">
      <div class="field-label">
        <label class="label">
          <button class="button removeProjectRow">remove</button>
        </label>
      </div>
      <div class="field-body">
        <div class="field">
          <p class="control is-expanded">
            <input class="input" type="text" name="url" placeholder="URL" />
          </p>
        </div>
        <div class="field">
          <p class="control is-expanded">
            <input class="input" type="text" name="regex" placeholder="Regex" />
          </p>
        </div>
      </div>
    </div>
    `
  );
  chrome.storage.sync.get(['defaultUrl', 'defaultRegex', 'projects'], function(result) {
    $('#defaultJiraUrl').val(result.defaultUrl);
    $('#defaultRegex').val(result.defaultRegex);
    if ($.isArray(result.projects)) {
      var $projects = $('#projects').empty();
      for (let project of result.projects) {
        let $row = $projectRowTemplate.clone();
        $row.find('[name=url]').val(project.url);
        $row.find('[name=regex]').val(project.regex);
        $projects.append($row);
      }
    }
  });

  $('#addRowButton').click(function() {
    $projectRowTemplate.clone().appendTo('#projects');
  });

  $('#projects').on('click', '.removeProjectRow', function() {
    $(this).parents('.projectRow').remove();
  });

  $('#saveButton').click(function() {
    save();
  });
});

function save() {
  saveDefaultUrl();
  saveDefaultRegex();
  saveProjectUrls();
}

function saveDefaultUrl() {
  var defaultJiraUrl = $('#defaultJiraUrl').val();
  chrome.storage.sync.set({
    defaultUrl: defaultJiraUrl
  }, function() {
    console.log('Default JIRA URL is ' + defaultJiraUrl);
  });
}

function saveDefaultRegex() {
  var defaultRegex = $('#defaultRegex').val();
  chrome.storage.sync.set({
    defaultRegex: defaultRegex
  }, function() {
    console.log('Default project regex is ' + defaultRegex);
  });
}

function saveProjectUrls() {
  var projectsArray = [];

  var $projectRows = $('#projects .projectRow');
  $projectRows.each(function() {
    var url = $(this).find('[name=url]').val();
    var regex = $(this).find('[name=regex]').val();
    projectsArray.push({
      url: url,
      regex: regex
    });
  });

  chrome.storage.sync.set({
    projects: projectsArray
  }, function() {
    console.log('Saved project URLs ' + JSON.stringify(projectsArray));
  });
}
