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
  $("[title]").tooltipster({
    theme: 'tooltipster-light',
    maxWidth: 300
  });

  var $projectRowTemplate = $(
    `
    <div class="field is-horizontal projectRow">
      <div class="field-label is-normal">
        <label class="label">
          <button class="button is-small removeProjectRow">
            <span class="icon has-text-grey">
              <i class="fas fa-trash"></i>
            </span>
          </button>
        </label>
      </div>
      <div class="field-body">
        <div class="field">
          <div class="control is-expanded">
            <input class="input" type="text" name="url" placeholder="URL" />
          </div>
        </div>
        <div class="field">
          <div class="control is-expanded">
            <input class="input" type="text" name="regex" placeholder="Regex" />
          </div>
        </div>
      </div>
    </div>
    `
  );
  var $excludedTemplate = $(
    `
    <div class="field is-horizontal exclusion">
      <div class="field-label is-normal">
        <label class="label">
          <button class="button is-small removeExclusion">
            <span class="icon has-text-grey">
              <i class="fas fa-trash"></i>
            </span>
          </button>
        </label>
      </div>
      <div class="field-body">
        <div class="field">
          <div class="control is-expanded">
            <input class="input" type="text" name="url" placeholder="URL" />
          </div>
        </div>
      </div>
    </div>
    `
  );
  chrome.storage.sync.get(['defaultUrl', 'defaultRegex', 'projects', 'exclusions'], function(result) {
    $('#defaultJiraUrl').val(result.defaultUrl);
    $('#defaultRegex').val(result.defaultRegex);
    if ($.isArray(result.projects)) {
      let $projects = $('#projects').empty();
      for (let project of result.projects) {
        let $row = $projectRowTemplate.clone();
        $row.find('[name=url]').val(project.url);
        $row.find('[name=regex]').val(project.regex);
        $projects.append($row);
      }
    }
    if ($.isArray(result.exclusions)) {
      let $exclusions = $('#exclusions');
      $exclusions.find('.exclusion').remove();
      let first = true;
      for (let exclusion of result.exclusions) {
        if (first) {
            $('#firstExclusion').val(exclusion);
            first = false;
        }
        else {
          let $exclusion = $excludedTemplate.clone();
          $exclusion.find('[name=url]').val(exclusion);
          $exclusions.append($exclusion);
        }
      }
    }
  });

  $('#addRowButton').click(function() {
    $projectRowTemplate.clone().appendTo('#projects');
  });

  $('#projects').on('click', '.removeProjectRow', function() {
    $(this).parents('.projectRow').remove();
  });

  $('#addExclusionButton').click(function() {
      $excludedTemplate.clone().appendTo('#exclusions');
  });

  $('#exclusions').on('click', '.removeExclusion', function() {
    $(this).parents('.exclusion').remove();
  });

  $('#saveButton').click(function() {
    save();
  });
});

function save() {
  saveDefault();
  saveProjectUrls();
  saveExclusions();
}

function saveDefault() {
  var defaultJiraUrl = $('#defaultJiraUrl').val();
  var defaultRegex = $('#defaultRegex').val();
  chrome.storage.sync.set({
    'defaultUrl': defaultJiraUrl,
    'defaultRegex': defaultRegex
  }, function() {
    console.log('Default JIRA URL is ' + defaultJiraUrl);
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
      'url': url,
      'regex': regex
    });
  });

  chrome.storage.sync.set({
    'projects': projectsArray
  }, function() {
    console.log('Saved project URLs ' + JSON.stringify(projectsArray));
  });
}

function saveExclusions() {
  let exclusionsArray = [];

  $('#exclusions [name=url]').each(function() {
      let value = $(this).val();
      if (value.trim() !== "") {
          exclusionsArray.push(value);
      }
  });

  chrome.storage.sync.set({
      'exclusions': exclusionsArray
  }, function() {
      console.log('Saved exclusions URLs ' + JSON.stringify(exclusionsArray));
  });
}
