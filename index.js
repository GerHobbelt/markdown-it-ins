'use strict';


module.exports = function ins_plugin(md) {
  // Insert each marker as a separate text token, and add it to delimiter list
  //
  function tokenize(state, silent) {
    var i, scanned, token, len, ch,
        start = state.pos,
        marker = state.src.charCodeAt(start);

    if (silent) { return false; }

    if (marker !== 0x2B/* + */) { return false; }

    scanned = state.scanDelims(state.pos, true);
    len = scanned.length;
    ch = String.fromCharCode(marker);

    if (len < 2) { return false; }

    if (len % 2) {
      token         = state.push('text', '', 0);
      token.content = ch;
      len--;
    }

    for (i = 0; i < len; i += 2) {
      token         = state.push('text', '', 0);
      token.content = ch + ch;

      if (!scanned.can_open && !scanned.can_close) { continue; }

      state.delimiters.push({
        marker: marker,
        length: 0, // disable "rule of 3" length checks meant for emphasis
        jump:   i,
        token:  state.tokens.length - 1,
        end:    -1,
        open:   scanned.can_open,
        close:  scanned.can_close
      });
    }

    state.pos += scanned.length;

    return true;
  }


  // Walk through delimiter list and replace text tokens with tags
  //
  function postProcess(state, delimiters) {
    var i, j,
        startDelim,
        endDelim,
        token,
        loneMarkers = [],
        max = delimiters.length;

    for (i = 0; i < max; i++) {
      startDelim = delimiters[i];

      if (startDelim.marker !== 0x2B/* + */) {
        continue;
      }

      if (startDelim.end === -1) {
        continue;
      }

      endDelim = delimiters[startDelim.end];

      token         = state.tokens[startDelim.token];
      token.type    = 'ins_open';
      token.tag     = 'ins';
      token.nesting = 1;
      token.markup  = '++';
      token.content = '';

      token         = state.tokens[endDelim.token];
      token.type    = 'ins_close';
      token.tag     = 'ins';
      token.nesting = -1;
      token.markup  = '++';
      token.content = '';

      if (state.tokens[endDelim.token - 1].type === 'text' &&
          state.tokens[endDelim.token - 1].content === '+') {

        loneMarkers.push(endDelim.token - 1);
      }
    }

    // If a marker sequence has an odd number of characters, it's splitted
    // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
    // start of the sequence.
    //
    // So, we have to move all those markers after subsequent s_close tags.
    //
    while (loneMarkers.length) {
      i = loneMarkers.pop();
      j = i + 1;

      while (j < state.tokens.length && state.tokens[j].type === 'ins_close') {
        j++;
      }

      j--;

      if (i !== j) {
        token = state.tokens[j];
        state.tokens[j] = state.tokens[i];
        state.tokens[i] = token;
      }
    }
  }

  md.inline.ruler.before('emphasis', 'ins', tokenize);
  md.inline.ruler2.before('emphasis', 'ins', function (state) {
    var curr,
        tokens_meta = state.tokens_meta,
        max = (state.tokens_meta || []).length;

    postProcess(state, state.delimiters);

    for (curr = 0; curr < max; curr++) {
      if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
        postProcess(state, tokens_meta[curr].delimiters);
      }
    }
  });
};

// TODO: added from ins-del plugin: mix into code above

function insertweditor(state, silent) {
  var startCount,
      count,
      tagCount,
      found,
      stack,
      res,
      token,
      insertSuccess,
      max = state.posMax,
      start = state.pos,
      marker = state.src.charCodeAt(start);

  if (marker !== 0x2B  /* 0x2B = + */) { return false; }
  if (silent) { return false; } // don't run any pairs in validation mode

  res = scanDelims(state, start);
  startCount = res.delims;

  if (!res.can_open) {
    state.pos += startCount;
    // Earlier we checked !silent, but this implementation does not need it
    state.pending += state.src.slice(start, state.pos);
    return true;
  }

  stack = Math.floor(startCount / 2);
  if (stack <= 0) { return false; }
  state.pos = start + startCount;

  while (state.pos < max) {
    if (state.src.charCodeAt(state.pos) === marker) {
      res = scanDelims(state, state.pos);
      count = res.delims;
      tagCount = Math.floor(count / 2);
      if (res.can_close) {
        if (tagCount >= stack) {
          state.pos += count - 2;
          found = true;
          break;
        }
        stack -= tagCount;
        state.pos += count;
        continue;
      }

      if (res.can_open) { stack += tagCount; }
      state.pos += count;
      continue;
    }

    state.md.inline.skipToken(state);
  }

  if (!found) {
    // parser failed to find ending tag, so it's not valid emphasis
    state.pos = start;
      insertSuccess = false;
    return false;
  }

  // found!
  state.posMax = state.pos;
  state.pos = start + 2;

  // Earlier we checked !silent, but this implementation does not need it
  // state.push('ins_open', 'ins', 1); change here for html open tag, and close tag down
  token        = state.push('ins_open', 'ins', 1);
  token.markup = String.fromCharCode(marker) + String.fromCharCode(marker);

  state.md.inline.tokenize(state);

  token        = state.push('ins_close', 'ins', -1);
  token.markup = String.fromCharCode(marker) + String.fromCharCode(marker);

  state.pos = state.posMax + 2;
  state.posMax = max;

    insertSuccess = true;

    // Adding editor as superscript after insert tag
    if (!insertSuccess) {
        return true;
    }
    var UNESCAPE_RE = /\\([ \\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;

    var foundStart,
        labelStart,
        content,
        token2,
        max2 = state.posMax,
        start2 = state.pos;

    if (state.src.charCodeAt(start2) !== 0x5B /* [ */) { return true; } // don't need to addeditor at all
    if (silent) { return false; } // don't run any pairs in validation mode
    if (start2 >= max2 || start2 + 2 >= max2) { return false; }

    state.pos = start2 + 1;

    while (state.pos < max2) {
        if (state.src.charCodeAt(state.pos) === 0x5D /* [ */) {
            foundStart = true;
            break;
        }
        state.md.inline.skipToken(state);
    }

    if (!foundStart || start2 + 1 === state.pos) {
        state.pos = start2;
        return false;
    }

    content = state.src.slice(start2 + 1, state.pos);

    // don't allow unescaped spaces/newlines inside
    if (content.match(/(^|[^\\])(\\\\)*\s/)) {
        state.pos = start2;
        return false;
    }

    // found!
    state.posMax = state.pos;
    labelStart = start2 + 1;
    state.pos = labelStart;

    // Earlier we checked !silent, but this implementation does not need it
    token2         = state.push('sup_open', 'sup', 1);
    token2.markup  = '[';

    //token2         = state.push('text', '', 0);
    //token2.content = content.replace(UNESCAPE_RE, '$1');
    //token2.markup = String.fromCharCode(marker);

    state.md.inline.tokenize(state);

    token2         = state.push('sup_close', 'sup', -1);
    token2.markup  = ']';

    state.pos = state.posMax+ 1;
    state.posMax = max2;

    return true;
}

function deleteweditor(state, silent) {
    var startCount,
        count,
        tagCount,
        found,
        stack,
        res,
        token,
        deleteSuccess,
        max = state.posMax,
        start = state.pos,
        marker = state.src.charCodeAt(start);

    if (marker !== 0x21  /* 0x21 = ! */) { return false; } // -- interfered with em-dash when markdown-it typography enabled
    if (silent) { return false; } // don't run any pairs in validation mode

    res = scanDelims(state, start);
    startCount = res.delims;

    if (!res.can_open) {
        state.pos += startCount;
        // Earlier we checked !silent, but this implementation does not need it
        state.pending += state.src.slice(start, state.pos);
        return true;
    }

    stack = Math.floor(startCount / 2);
    if (stack <= 0) { return false; }
    state.pos = start + startCount;

    while (state.pos < max) {
        if (state.src.charCodeAt(state.pos) === marker) {
            res = scanDelims(state, state.pos);
            count = res.delims;
            tagCount = Math.floor(count / 2);
            if (res.can_close) {
                if (tagCount >= stack) {
                    state.pos += count - 2;
                    found = true;
                    break;
                }
                stack -= tagCount;
                state.pos += count;
                continue;
            }

            if (res.can_open) { stack += tagCount; }
            state.pos += count;
            continue;
        }

        state.md.inline.skipToken(state);
    }

    if (!found) {
        // parser failed to find ending tag, so it's not valid emphasis
        state.pos = start;
        deleteSuccess = false;
        return false;
    }

    // found!
    state.posMax = state.pos;
    state.pos = start + 2;

    // Earlier we checked !silent, but this implementation does not need it
    // state.push('del_open', 'del', 1); change here for html open tag, and close tag down
    token        = state.push('del_open', 'del', 1);
    token.markup = String.fromCharCode(marker) + String.fromCharCode(marker);

    state.md.inline.tokenize(state);

    token        = state.push('del_close', 'del', -1);
    token.markup = String.fromCharCode(marker) + String.fromCharCode(marker);

    state.pos = state.posMax + 2;
    state.posMax = max;

    deleteSuccess = true;

    // Adding editor as superscript after delete tag
    if (!deleteSuccess) {
        return true;
    }
    var UNESCAPE_RE = /\\([ \\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;

    var foundStart,
        labelStart,
        content,
        token2,
        max2 = state.posMax,
        start2 = state.pos;

    if (state.src.charCodeAt(start2) !== 0x5B /* [ */) { return true; } // don't need to addeditor at all
    if (silent) { return false; } // don't run any pairs in validation mode
    if (start2 >= max2 || start2 + 2 >= max2) { return false; }

    state.pos = start2 + 1;

    while (state.pos < max2) {
        if (state.src.charCodeAt(state.pos) === 0x5D /* [ */) {
            foundStart = true;
            break;
        }
        state.md.inline.skipToken(state);
    }

    if (!foundStart || start2 + 1 === state.pos) {
        state.pos = start2;
        return false;
    }

    content = state.src.slice(start2 + 1, state.pos);

    // don't allow unescaped spaces/newlines inside
    if (content.match(/(^|[^\\])(\\\\)*\s/)) {
        state.pos = start2;
        return false;
    }

    // found!
    state.posMax = state.pos;
    labelStart = start2 + 1;
    state.pos = labelStart;

    // Earlier checked !silent, but this implementation does not need it
    token2         = state.push('sup_open', 'sup', 1);
    token2.markup  = '[';

    //token2         = state.push('text', '', 0);
    //token2.content = content.replace(UNESCAPE_RE, '$1');
    //token2.markup = String.fromCharCode(marker);

    state.md.inline.tokenize(state);

    token2         = state.push('sup_close', 'sup', -1);
    token2.markup  = ']';

    state.pos = state.posMax+ 1;
    state.posMax = max2;

    return true;
}

//module.exports = 
function ins_del_plugin(md) {
    // new rule will be added before this one, name of added rule, rule function.
    md.inline.ruler.before('emphasis', 'ins', insertweditor);
    md.inline.ruler.before('emphasis', 'del', deleteweditor);
};
