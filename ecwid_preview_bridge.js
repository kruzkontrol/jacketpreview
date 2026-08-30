/* Kanework - feed the Ecwid product options into the jacket preview.
 *
 * Paste this into the Ecwid control panel under the store's custom
 * JavaScript. It watches the product option fields, and every time one
 * changes it sends the values to the preview iframe, which redraws.
 *
 * Nothing here changes what the customer's order says. The options are
 * still Ecwid's; this only shows them a picture of what they chose.
 *
 * If a field ever stops feeding through, set KWP_DEBUG to true below,
 * open the product page, and read the browser console: it prints every
 * option label it found and which preview field it matched, so a label
 * renamed in Ecwid shows up immediately instead of failing silently.
 */
(function () {
  "use strict";

  var KWP_DEBUG = false;

  // The preview's address. Change it here if the tunnel address ever
  // changes, and nowhere else.
  var PREVIEW_HOST = "tail261222.ts.net";

  /* ---- which Ecwid option feeds which preview field ---------------
   * The key is the option's LABEL as typed in Ecwid, normalised:
   * upper case, punctuation turned into spaces, runs collapsed. So
   * "SHIP (BOTTOM OF JACKET)" is written here as
   * "SHIP BOTTOM OF JACKET".
   *
   * Rename an option in Ecwid and you must rename it here too.
   */
  var FIELDS = {
    "LINE NAME": "line",
    "LINE NUMBER": "number",
    "SHIP BOTTOM OF JACKET": "ship",
    "CHAPTER": "chapter",
    "CROSSING SEASON": "crossing",
    "NECK LETTERING": "neck",
    "JACKET COLOR": "jacket",
    "LETTER COLOR": "letter",
    "OUTLINE COLOR": "outline",
    "LINE NUMBER COLOR": "number_color",
    "OUTLINE NUMBER": "number_outline"
  };

  // Which of those are colours, so their values get checked.
  var COLOUR_FIELDS = {
    jacket: 1, letter: 1, outline: 1,
    number_color: 1, number_outline: 1
  };

  // Store names for a colour the preview knows under another name.
  // CREAM, TAN and KHAKI are one colour in the shop.
  var COLOUR_ALIAS = {
    "CREAM": "KHAKI",
    "TAN": "KHAKI",
    "GRAY": "GREY",
    "ROYAL BLUE": "BLUE",
    "ROYAL": "BLUE"
  };

  // Values that are not a colour at all. These are NOT sent, so the
  // preview holds whatever it was showing - an out-of-date jacket
  // rather than a wrong one.
  var NOT_A_COLOUR = {
    "": 1,
    "PLEASE CHOOSE": 1,
    "PLEASE SELECT": 1,
    "CHOOSE": 1,
    "OTHER": 1,
    "OTHER TYPE BELOW": 1,
    "NONE": 1
  };

  function norm(s) {
    return String(s === null || s === undefined ? "" : s)
      .replace(/[\u2018\u2019\u201c\u201d]/g, "")
      .replace(/[^A-Za-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }

  /* ---- finding an option's label ----------------------------------
   * Ecwid gives the inputs generated ids, so the only stable handle on
   * a field is the words the customer reads next to it. Several ways
   * are tried in turn because the storefront's markup differs between
   * text boxes, dropdowns and radio groups.
   */
  function textWithoutControls(node) {
    var copy = node.cloneNode(true);
    var junk = copy.querySelectorAll(
      "input,select,textarea,option,button,script,style,img,svg");
    for (var i = 0; i < junk.length; i++) {
      if (junk[i].parentNode) junk[i].parentNode.removeChild(junk[i]);
    }
    return copy.textContent || "";
  }

  function labelFor(el) {
    var aria = el.getAttribute && el.getAttribute("aria-label");
    if (aria) return aria;

    if (el.id) {
      var byFor = null;
      try {
        byFor = document.querySelector(
          'label[for="' + el.id.replace(/"/g, '\\"') + '"]');
      } catch (e) { byFor = null; }
      if (byFor) return textWithoutControls(byFor);
    }

    var wrap = el.closest ? el.closest("label") : null;
    if (wrap) {
      var t = norm(textWithoutControls(wrap));
      if (t) return t;
    }

    // Walk up a few levels and take the first ancestor that has words
    // of its own. The immediate wrapper is normally the label; going
    // further would start collecting the whole product page.
    var node = el.parentElement;
    var hops = 0;
    while (node && hops < 5) {
      var text = norm(textWithoutControls(node));
      if (text) return text;
      node = node.parentElement;
      hops++;
    }
    return "";
  }

  function fieldFor(el) {
    var label = norm(labelFor(el));
    if (!label) return null;

    if (FIELDS[label]) return FIELDS[label];

    // The wrapper sometimes picks up a stray word or a price. Fall
    // back to the LONGEST known label contained in the text, so
    // "LINE NUMBER COLOR" is never mistaken for "LINE NUMBER".
    if (label.length <= 60) {
      var best = null;
      for (var key in FIELDS) {
        if (!Object.prototype.hasOwnProperty.call(FIELDS, key)) continue;
        if (label.indexOf(key) === -1) continue;
        if (best === null || key.length > best.length) best = key;
      }
      if (best) return FIELDS[best];
    }
    return null;
  }

  /* ---- reading the current values ---------------------------------- */

  function valueOf(el) {
    if (el.type === "radio") return el.checked ? el.value : null;
    if (el.type === "checkbox") return el.checked ? el.value : null;
    return el.value;
  }

  function collect() {
    var values = {};
    var els = document.querySelectorAll("input,select,textarea");

    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.type === "hidden" || el.type === "file") continue;

      var field = fieldFor(el);
      if (!field) continue;

      var raw = valueOf(el);
      if (raw === null) continue;

      if (COLOUR_FIELDS[field]) {
        var name = norm(raw);
        if (NOT_A_COLOUR[name]) continue;      // leave the last colour
        if (COLOUR_ALIAS[name]) name = COLOUR_ALIAS[name];
        values[field] = name;
      } else {
        values[field] = String(raw).trim();
      }

      if (KWP_DEBUG) {
        console.log("[kanework] " + field + " <- " +
                    JSON.stringify(norm(labelFor(el))) +
                    " = " + JSON.stringify(values[field]));
      }
    }
    return values;
  }

  /* ---- sending them to the preview --------------------------------- */

  function frame() {
    var frames = document.getElementsByTagName("iframe");
    for (var i = 0; i < frames.length; i++) {
      var src = frames[i].getAttribute("src") || "";
      if (src.indexOf(PREVIEW_HOST) !== -1) return frames[i];
    }
    return null;
  }

  function send() {
    var f = frame();
    if (!f || !f.contentWindow) return;

    var values = collect();
    if (KWP_DEBUG) console.log("[kanework] sending", values);

    try {
      f.contentWindow.postMessage(
        { type: "kanework-preview", values: values }, "*");
    } catch (e) {
      if (KWP_DEBUG) console.log("[kanework] send failed", e);
    }
  }

  var timer = null;
  function schedule(wait) {
    clearTimeout(timer);
    timer = setTimeout(send, wait === undefined ? 300 : wait);
  }

  /* ---- when to send ------------------------------------------------
   * Listening on the document rather than on each field, because Ecwid
   * rebuilds the option markup as the customer moves around the store
   * and any listener attached to a field would be thrown away with it.
   */
  document.addEventListener("input", function () { schedule(); }, true);
  document.addEventListener("change", function () { schedule(); }, true);

  // The preview says hello when it has loaded. Answering that is what
  // fills it in the first time, without guessing how long it took.
  window.addEventListener("message", function (ev) {
    var d = ev.data;
    if (d && d.type === "kanework-preview-ready") send();
  });

  // And send once the store page settles, in case the preview loaded
  // before this script did and its hello was missed.
  if (window.Ecwid && Ecwid.OnPageLoaded) {
    Ecwid.OnPageLoaded.add(function () {
      // Two goes, on their own timers - schedule() would cancel the
      // first with the second. The early one covers the normal case;
      // the later one covers a slow iframe.
      setTimeout(send, 800);
      setTimeout(send, 2500);
    });
  } else {
    schedule(1500);
  }
})();
