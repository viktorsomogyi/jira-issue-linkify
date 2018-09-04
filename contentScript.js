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

var jQ = $.noConflict(true);

// function to decide whether a parent tag will have its text replaced or not
function isTagOk(node) {
    var tagsWhitelist = ['A', 'PRE', 'BLOCKQUOTE', 'CODE', 'INPUT', 'BUTTON', 'TEXTAREA'];
    var tag = node.parentNode.tagName;
    var pptag = node.parentNode.parentNode.tagName;
    return "DEL" !== tag && tagsWhitelist.indexOf(pptag) === -1 && tagsWhitelist.indexOf(tag) === -1;
}

function scanReplaceText(mutationList, projectNames, projectUrls) {
  if (mutationList === null || mutationList === undefined) {
    return;
  }
  Array.from(mutationList).forEach(function(element) {
    Array.from(element.addedNodes).forEach(function(addedNode) {
      scanReplaceTextInNode(addedNode, projectNames, projectUrls);
    });
  });
}

function scanReplaceTextInNode(node, projectNames, projectUrls) {
  var texts = document.evaluate('.//text()[ normalize-space(.) != "" ]', node, null, 6, null);
  var text;
  for (var i = 0; text = texts.snapshotItem(i); i += 1) {
    if ( isTagOk(text) ) {
      projectNames.forEach(function (value, index) {
        var data = text.data;
        var htmlNodes = jQ.parseHTML(data.replace( value, projectUrls[index] ));
        var parent = text.parentNode
        if (parent !== null || parent !== undefined) {
          for (var k = 0; k < htmlNodes.length; k++) {
            if (htmlNodes[k].nodeName === "A") {
              for (var j = 0; j < htmlNodes.length; j++) {
                jQ(parent).append(htmlNodes[j]);
              }
              parent.removeChild(text);
              break;
            }
          }
        }
      });
    }
  }
}

function asLink(url) {
  return "<a href=\""+url+"$&\" target=\"_blank\">$&</a>";
}

function loadAndRun(mutationList) {
  chrome.storage.sync.get(['defaultUrl', 'defaultRegex', 'projects'], function(result) {
    var projectNames = [];
    var projectUrls = [];
    result.projects.forEach(function(project) {
      projectNames.push(new RegExp(project.url, 'g'));
      projectUrls.push(asLink(project.regex));
    });
    projectNames.push(new RegExp(result.defaultRegex, 'g'));
    projectUrls.push(asLink(result.defaultUrl));

    if (mutationList === document) {
      scanReplaceTextInNode(document, projectNames, projectUrls);
    } else {
      scanReplaceText(mutationList, projectNames, projectUrls);
    }
  });
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  loadAndRun(null);
});

var config = { childList: true, subtree: true };
var observer = new MutationObserver(loadAndRun);
var documentElements = document.getElementsByTagName('body');
for (var i = 0; i < documentElements.length; ++i) {
  observer.observe(documentElements[i], config);
}

loadAndRun(document);
