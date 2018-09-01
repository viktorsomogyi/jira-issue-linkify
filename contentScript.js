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

var projectNames = []
var projectUrls = []

var jQ = $.noConflict(true);

function asLink(url) {
  return "<a href=\""+url+"$&\" target=\"_blank\">$&</a>";
}

chrome.storage.sync.get(['defaultUrl', 'defaultRegex', 'projects'], function(result) {
  result.projects.forEach(function(project) {
    projectNames.push(new RegExp(project[0], 'g'));
    projectUrls.push(asLink(project[1]));
  });
  projectNames.push(new RegExp(result.defaultRegex, 'g'));
  projectUrls.push(asLink(result.defaultUrl));
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (let key in changes) {
    var storageChange = changes['projects'];
    projects = storageChange.newValue;
    console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
  }
});

var words = {
    'KAFKA-\\d{1,6}':"<a href=\"https://issues.apache.org/jira/browse/$&\" target=\"_blank\">$&</a>",
    'SENTRY-\\d{1,6}':"<a href=\"https://issues.apache.org/jira/browse/$&\" target=\"_blank\">$&</a>",
    'CDH-\\d{1,6}':"<a href=\"https://jira.cloudera.com/browse/$&\" target=\"_blank\">$&</a>",

'':''};

var regexs = [], replacements = [],
    tagsWhitelist = ['A', 'PRE', 'BLOCKQUOTE', 'CODE', 'INPUT', 'BUTTON', 'TEXTAREA'],
    rIsRegexp = /^\/(.+)\/([gim]+)?$/,
    word, text, texts, i, userRegexp;

// function to decide whether a parent tag will have its text replaced or not
function isTagOk(node) {
    var tag = node.parentNode.tagName;
    var pptag = node.parentNode.parentNode.tagName;
    // console.log(tag + "->" + pptag);
    return "DEL" !== tag && tagsWhitelist.indexOf(pptag) === -1 && tagsWhitelist.indexOf(tag) === -1;
}

delete words['']; // so the user can add each entry ending with a comma,
                  // I put an extra empty key/value pair in the object.
                  // so we need to remove it before continuing

// convert the 'words' JSON object to an Array
for (word in words) {
    if ( typeof word === 'string' && words.hasOwnProperty(word) ) {
        userRegexp = word.match(rIsRegexp);

        // add the search/needle/query
        if (userRegexp) {
            regexs.push(
                new RegExp(userRegexp[1], 'g')
            );
        } else {
            regexs.push(
                new RegExp(word, 'g')
            );
        }

        // add the replacement
        replacements.push( words[word] );
    }
}

function scanReplaceText(mutationList) {
  if (mutationList === null || mutationList === undefined) {
    return;
  }
  Array.from(mutationList).forEach(function(element) {
    Array.from(element.addedNodes).forEach(function(addedNode) {
      scanReplaceTextInNode(addedNode);
    });
  });
}

function scanReplaceTextInNode(node) {
  texts = document.evaluate('.//text()[ normalize-space(.) != "" ]', node, null, 6, null);
  for (var i = 0; text = texts.snapshotItem(i); i += 1) {
    if ( isTagOk(text) ) {
      regexs.forEach(function (value, index) {
        var data = text.data;
        var htmlNodes = jQ.parseHTML(data.replace( value, replacements[index] ));
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

var config = { childList: true, subtree: true };
var observer = new MutationObserver(scanReplaceText);
var documentElements = document.getElementsByTagName('body');
for (var i = 0; i < documentElements.length; ++i) {
  observer.observe(documentElements[i], config);
}

scanReplaceTextInNode(document);