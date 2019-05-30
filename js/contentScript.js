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

var JIRAFIED = 'jirafied';

// when config changes
chrome.storage.onChanged.addListener(function(changes, namespace) {
  loadAndRun();
});

// when html changes
new MutationObserver(loadAndRun)
  .observe(
    document.body, {
      childList: true,
      subtree: true
    }
  );

// first time
loadAndRun();

function loadAndRun(mutationList) {
  chrome.storage.sync.get(['defaultUrl', 'defaultRegex', 'projects', 'exclusions'], function(result) {
    if ($.isArray(result.exclusions)) {
        for (let exclusion of result.exclusions) {
          if (window.location.href.indexOf(exclusion) !== -1) {
            return;
          }
        }
    }
    var projectConfigs = [];
    result.projects.forEach(function(project) {
      projectConfigs.push(createProjectConfig(project.url, project.regex));
    });
    projectConfigs.push(createProjectConfig(result.defaultUrl, result.defaultRegex));

    if (mutationList === undefined) {
      scanReplaceTextInNode(document.body, projectConfigs);
    } else {
      scanReplaceText(mutationList, projectConfigs);
    }
  });
}

function createProjectConfig(url, regex) {
  return {
    url: asLink(url),
    wrappedRegex: new RegExp(`(^|\\s+)${regex}($|\s+)`, 'g'),
    regex: new RegExp(regex, 'g')
  };
}

function asLink(url) {
  return `<a href="${url}$&" target="_blank" ${JIRAFIED}>$&</a>`;
}

function scanReplaceText(mutationList, projectConfigs) {
  if (mutationList === null || mutationList === undefined) {
    return;
  }
  Array.from(mutationList).forEach(function(element) {
    Array.from(element.addedNodes).forEach(function(addedNode) {
      scanReplaceTextInNode(addedNode, projectConfigs);
    });
  });
}

function scanReplaceTextInNode(node, projectConfigs) {
  $('*', node)
    .contents()
    .filter(function() {
      return this.nodeType === Node.TEXT_NODE &&
        $.trim(this.data) !== "" &&
        containsPattern(this.data, projectConfigs) &&
        allowedParentNodeName(this) &&
        notJirafied(this);
    }).each(function() {
      for (let config of projectConfigs) {
        if (config.wrappedRegex.test(this.data)) {
          var nodes = $.parseHTML(this.data.replace(config.regex, config.url));
          for (let node of nodes) {
            this.before(node);
          }
          this.remove();
          break;
        }
      }
    });
}

function allowedParentNodeName(node) {
  return $(node).parents('a,script,noscript,textarea,svg,[role=dialog]').length === 0;
}

function notJirafied(node) {
  return !(node.parentNode && node.parentNode.hasAttribute(JIRAFIED));
}

function containsPattern(text, projectConfigs) {
  for (let config of projectConfigs) {
    if (config.wrappedRegex.test(text)) {
      return true;
    }
  }
  return false;
}
