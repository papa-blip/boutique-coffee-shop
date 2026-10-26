// Bean Boutique: on-page animated text search (used on every page).
// Highlights every match inside <main>, pulses the highlights, jumps to the
// first match, and lets Enter step through the results.
(function () {
  var input = document.getElementById('page-search-input');
  var countLabel = document.getElementById('page-search-count');
  var root = document.querySelector('main');
  if (!input || !root) { return; }

  var hits = [];
  var currentIndex = -1;
  var skipTags = { SCRIPT: 1, STYLE: 1, SELECT: 1, OPTION: 1, TEXTAREA: 1, INPUT: 1, MARK: 1 };

  function clearHighlights() {
    root.querySelectorAll('mark.search-hit').forEach(function (mark) {
      var parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
    hits = [];
    currentIndex = -1;
  }

  function collectTextNodes(node, list) {
    node.childNodes.forEach(function (child) {
      if (child.nodeType === 3) {
        if (child.nodeValue.trim() !== '') { list.push(child); }
      } else if (child.nodeType === 1 && !skipTags[child.tagName]) {
        collectTextNodes(child, list);
      }
    });
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlight(term) {
    var pattern = new RegExp(escapeRegExp(term), 'gi');
    var nodes = [];
    collectTextNodes(root, nodes);

    nodes.forEach(function (textNode) {
      var text = textNode.nodeValue;
      pattern.lastIndex = 0;
      if (!pattern.test(text)) { return; }
      pattern.lastIndex = 0;

      var fragment = document.createDocumentFragment();
      var last = 0;
      var match;
      while ((match = pattern.exec(text)) !== null) {
        fragment.appendChild(document.createTextNode(text.slice(last, match.index)));
        var mark = document.createElement('mark');
        mark.className = 'search-hit';
        mark.textContent = match[0];
        fragment.appendChild(mark);
        hits.push(mark);
        last = match.index + match[0].length;
      }
      fragment.appendChild(document.createTextNode(text.slice(last)));
      textNode.parentNode.replaceChild(fragment, textNode);
    });
  }

  function goTo(index) {
    if (hits.length === 0) { return; }
    if (currentIndex >= 0) { hits[currentIndex].classList.remove('current'); }
    currentIndex = (index + hits.length) % hits.length;
    var target = hits[currentIndex];
    target.classList.add('current');

    // Open any collapsed <details> so a hidden match becomes visible.
    var details = target.closest('details');
    if (details) { details.open = true; }

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    countLabel.textContent = (currentIndex + 1) + ' of ' + hits.length;
  }

  input.addEventListener('input', function () {
    clearHighlights();
    var term = input.value.trim();
    if (term.length < 2) { countLabel.textContent = ''; return; }

    highlight(term);
    if (hits.length === 0) {
      countLabel.textContent = 'No matches';
    } else {
      goTo(0);
    }
  });

  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      goTo(currentIndex + (event.shiftKey ? -1 : 1));
    } else if (event.key === 'Escape') {
      input.value = '';
      clearHighlights();
      countLabel.textContent = '';
    }
  });
})();
