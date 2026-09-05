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
  var PREVIEW_HOST = "desktop-rreq2p1.tail261222.ts.net";

  // How tall the preview frame is on the product page.
  var PREVIEW_HEIGHT = "480px";

  /* ---- which Ecwid option feeds which preview field --------------- */
  var FIELDS = {
    "LINE NAME": "line",
    "LINE NUMBER": "number",
    "SHIP BOTTOM OF JACKET": "ship",
    "CHAPTER": "chapter",
    "CROSSING SEASON": "crossing",
    "NECK LETTERING": "neck",
    "JACKET COLOR": "jacket",

    "BAG COLOR": "jacket",
    "STOLE COLOR": "jacket",

    // STOLE PERSONALIZATION
    "TOP LEFT": "stole_tl",
    "BOTTOM LEFT": "stole_bl",
    "TOP RIGHT": "stole_tr",
    "BOTTOM RIGHT": "stole_br",

    "SHIRT COLOR": "jacket",
    "TEE COLOR": "jacket",
    "HOODIE COLOR": "jacket",
    "CREWNECK COLOR": "jacket",
    "CARDIGAN COLOR": "jacket",
    "GARMENT COLOR": "jacket",

    "LETTER COLOR": "letter",
    "OUTLINE COLOR": "outline",
    "LINE NUMBER COLOR": "number_color",
    "OUTLINE NUMBER": "number_outline",

    "ORGANIZATION LETTER ON FRONT": "front_org",
    "WORDING THRU LETTERS": "wording",
    "ADD NAME UNDER CREST": "crest_name_on",
    "NAME UNDER CREST": "crest_name",

    "SIZE": "size",

    // DUFFLE
    "FREE NO CHARGE ORGANAZATION WORDING ON FRONT POCKET": "front_text",
    "ORGANAZATION WORDING ON FRONT POCKET": "front_text",
    "DO YOU WANT WORDING UNDER GREEK LETTERS": "crest_name_on",
    "CUSTOM WORDING UNDER": "crest_name",
    "ADD CREST SHIELD TO TOP OF BAG": "crest_on",

    // SATIN / CAMO CREST
    "ADD CREST SHIELD": "crest_on",
    "CREST SHIELD": "crest_on",
    "ADD CREST": "crest_on",
    "CREST": "crest_on"
  };

  function orgCode(raw) {
    var code = String(raw === null || raw === undefined ? "" : raw)
      .toUpperCase()
      .replace(/[^A-Z]/g, "");

    return Object.prototype.hasOwnProperty.call(ORG_FALLBACK, code)
      ? code
      : "NONE";
  }

  var COLOUR_FIELDS = {
    jacket: 1,
    letter: 1,
    outline: 1,
    number_color: 1,
    number_outline: 1
  };

  var COLOUR_ALIAS = {
    "CREAM": "KHAKI",
    "TAN": "KHAKI",
    "GRAY": "GREY",
    "ROYAL BLUE": "BLUE",
    "ROYAL": "BLUE"
  };

  var NOT_A_COLOUR = {
    "": 1,
    "PLEASE CHOOSE": 1,
    "PLEASE SELECT": 1,
    "CHOOSE": 1,
    "OTHER": 1,
    "OTHER TYPE BELOW": 1
  };

  var OUTLINE_FIELDS = {
    outline: 1,
    number_outline: 1
  };

  var AUTO_FIELDS = {
    letter: 1,
    outline: 1,
    number_color: 1,
    number_outline: 1
  };

  var NOT_CHOSEN = {
    "": 1,
    "PLEASE CHOOSE": 1,
    "PLEASE SELECT": 1,
    "CHOOSE": 1
  };

  var APPROVED = {
    ALPHAKAPPAALPHA: {
      BLACK: ["GREEN", "PINK"],
      WHITE: ["PINK", "GREEN"],
      PINK: ["PINK", "GREEN"],
      GREEN: ["GREEN", "PINK"],
      KHAKI: ["PINK", "GREEN"],
      "HOT PINK": ["HOT PINK", "GREEN"]
    },

    DELTASIGMATHETA: {
      BLACK: ["RED", "WHITE"],
      WHITE: ["WHITE", "RED"],
      RED: ["RED", "WHITE"],
      CRIMSON: ["CRIMSON", "KHAKI"],
      KHAKI: ["RED", "WHITE"],
      MAROON: ["CRIMSON", "KHAKI"]
    },

    ZETAPHIBETA: {
      BLACK: ["BLUE", "WHITE"],
      WHITE: ["WHITE", "BLUE"],
      BLUE: ["BLUE", "WHITE"],
      KHAKI: ["BLUE", "WHITE"]
    },

    SIGMAGAMMARHO: {
      WHITE: ["YELLOW", "BLUE"],
      BLACK: ["BLUE", "YELLOW"],
      YELLOW: ["YELLOW", "BLUE"],
      BLUE: ["BLUE", "YELLOW"],
      KHAKI: ["BLUE", "YELLOW"]
    },

    ALPHAPHIALPHA: {
      BLACK: ["BLACK", "OLD GOLD"],
      WHITE: ["OLD GOLD", "BLACK"],
      KHAKI: ["OLD GOLD", "BLACK"]
    },

    KAPPAALPHAPSI: {
      WHITE: ["WHITE", "RED"],
      RED: ["RED", "WHITE"],
      BLACK: ["RED", "WHITE"],
      CRIMSON: ["CRIMSON", "KHAKI"],
      KHAKI: ["RED", "WHITE"],
      MAROON: ["CRIMSON", "KHAKI"]
    },

    OMEGAPSIPHI: {
      PURPLE: ["PURPLE", "OLD GOLD"]
    },

    PHIBETASIGMA: {
      WHITE: ["WHITE", "BLUE"],
      BLACK: ["BLUE", "WHITE"],
      BLUE: ["BLUE", "WHITE"],
      KHAKI: ["BLUE", "WHITE"]
    },

    IOTAPHITHETA: {
      BROWN: ["BROWN", "YELLOW"],
      YELLOW: ["YELLOW", "BROWN"],
      KHAKI: ["YELLOW", "BROWN"]
    }
  };

  var ORG_FALLBACK = {
    ALPHAKAPPAALPHA: ["PINK", "GREEN"],
    DELTASIGMATHETA: ["WHITE", "RED"],
    ZETAPHIBETA: ["WHITE", "BLUE"],
    SIGMAGAMMARHO: ["YELLOW", "BLUE"],
    ALPHAPHIALPHA: ["OLD GOLD", "BLACK"],
    KAPPAALPHAPSI: ["WHITE", "CRIMSON"],
    OMEGAPSIPHI: ["OLD GOLD", "PURPLE"],
    PHIBETASIGMA: ["WHITE", "BLUE"],
    IOTAPHITHETA: ["YELLOW", "BROWN"]
  };

  var BASE_COLOUR = {
    "ROYAL": "BLUE",
    "TRUE ROYAL": "BLUE",
    "CAROLINA BLUE": "BLUE",
    "COOL BLUE": "BLUE",
    "COLUMBIA": "BLUE",
    "AQUA": "BLUE",
    "KELLY": "GREEN",
    "SAGE": "GREEN",
    "MAIZE YELLOW": "YELLOW",
    "CARDINAL": "CRIMSON",
    "FUCHSIA": "HOT PINK",
    "TEAM PURPLE": "PURPLE",
    "NATURAL": "KHAKI",
    "TAN": "KHAKI",
    "CREAM": "KHAKI",
    "ASH": "GREY",
    "GRAY": "GREY",
    "WOODLAND": "KHAKI"
  };

  var GARMENT_PREFIX = [
    "SATIN ",
    "TEE ",
    "DUFFLE ",
    "CAMO ",
    "HOODIE ",
    "SWEATSHIRT ",
    "CARDIGAN ",
    "POLO ",
    "STOLE "
  ];

  function baseColour(name) {
    var text = String(
      name === null || name === undefined ? "" : name
    )
      .trim()
      .toUpperCase();

    if (text.indexOf("/") !== -1) {
      text = text.split("/")[0];
    }

    for (var i = 0; i < GARMENT_PREFIX.length; i++) {
      if (text.indexOf(GARMENT_PREFIX[i]) === 0) {
        text = text.slice(GARMENT_PREFIX[i].length);
        break;
      }
    }

    text = text.replace(/\s+/g, " ").trim();

    return BASE_COLOUR[text] || text;
  }

  function recommended(org, jacket) {
    if (!org) return null;

    var byJacket = APPROVED[org];
    var plain = baseColour(jacket);

    if (byJacket && byJacket[plain]) {
      return byJacket[plain];
    }

    return ORG_FALLBACK[org] || null;
  }

  function norm(s) {
    return String(
      s === null || s === undefined ? "" : s
    )
      .replace(/[\u2018\u2019\u201c\u201d]/g, "")
      .replace(/[^A-Za-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }

  function normColour(s) {
    return String(
      s === null || s === undefined ? "" : s
    )
      .replace(/[\u2018\u2019\u201c\u201d]/g, "")
      .replace(/\([^)]*\)/g, " ")
      .replace(/[^A-Za-z0-9\/]+/g, " ")
      .replace(/\s*\/\s*/g, "/")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }

  /* ================================================================
     FIND ECWID OPTION LABELS
     ================================================================ */

  function textWithoutControls(node) {
    var copy = node.cloneNode(true);

    var junk = copy.querySelectorAll(
      "input,select,textarea,option,button,script,style,img,svg"
    );

    for (var i = 0; i < junk.length; i++) {
      if (junk[i].parentNode) {
        junk[i].parentNode.removeChild(junk[i]);
      }
    }

    return copy.textContent || "";
  }

  function labelFor(el) {
    var out = [];

    if (el.id) {
      var byFor = null;

      try {
        byFor = document.querySelector(
          'label[for="' +
            el.id.replace(/"/g, '\\"') +
            '"]'
        );
      } catch (e) {
        byFor = null;
      }

      if (byFor) {
        out.push(
          norm(
            textWithoutControls(byFor)
          )
        );
      }
    }

    var wrap = el.closest
      ? el.closest("label")
      : null;

    if (wrap) {
      out.push(
        norm(
          textWithoutControls(wrap)
        )
      );
    }

    var node = el.parentElement;
    var hops = 0;

    while (node && hops < 6) {
      var text = norm(
        textWithoutControls(node)
      );

      if (text) {
        out.push(text);
      }

      node = node.parentElement;
      hops++;
    }

    return out;
  }

  function matchLabel(label) {
    if (!label) {
      return null;
    }

    if (FIELDS[label]) {
      return FIELDS[label];
    }

    if (label.length <= 60) {
      var best = null;

      for (var key in FIELDS) {
        if (
          !Object.prototype.hasOwnProperty.call(
            FIELDS,
            key
          )
        ) {
          continue;
        }

        if (label.indexOf(key) === -1) {
          continue;
        }

        if (
          best === null ||
          key.length > best.length
        ) {
          best = key;
        }
      }

      if (best) {
        return FIELDS[best];
      }
    }

    return null;
  }

  function fieldFor(el) {
    var aria =
      el.getAttribute &&
      el.getAttribute("aria-label");

    if (aria) {
      var byAria =
        matchLabel(
          norm(aria)
        );

      if (byAria) {
        return byAria;
      }
    }

    var levels = labelFor(el);

    for (var i = 0; i < levels.length; i++) {
      var hit =
        matchLabel(
          levels[i]
        );

      if (hit) {
        return hit;
      }
    }

    return null;
  }

  /* ================================================================
     READ CURRENT OPTION VALUES
     ================================================================ */

  function valueOf(el) {
    if (el.type === "radio") {
      return el.checked
        ? el.value
        : null;
    }

    if (el.type === "checkbox") {
      return el.checked
        ? el.value
        : null;
    }

    return el.value;
  }

  function collect() {
    var values = {};

    var els =
      document.querySelectorAll(
        "input,select,textarea"
      );

    for (var i = 0; i < els.length; i++) {
      var el = els[i];

      if (
        el.type === "hidden" ||
        el.type === "file"
      ) {
        continue;
      }

      var field =
        fieldFor(el);

      if (!field) {
        continue;
      }

      var raw =
        valueOf(el);

      if (raw === null) {
        continue;
      }

      if (COLOUR_FIELDS[field]) {
        var name =
          normColour(raw);

        if (
          AUTO_FIELDS[field] &&
          NOT_CHOSEN[name]
        ) {
          values[field] = "AUTO";
          continue;
        }

        if (NOT_A_COLOUR[name]) {
          continue;
        }

        if (
          name === "NONE" &&
          !OUTLINE_FIELDS[field]
        ) {
          continue;
        }

        if (COLOUR_ALIAS[name]) {
          name = COLOUR_ALIAS[name];
        }

        values[field] = name;
      }

      else if (field === "front_org") {
        values[field] =
          orgCode(raw);
      }

      else if (
        field === "wording" ||
        field === "crest_name_on" ||
        field === "crest_on"
      ) {
        values[field] =
          norm(raw).indexOf("YES") === 0
            ? "YES"
            : "NO";
      }

      else {
        values[field] =
          String(raw).trim();
      }

      if (KWP_DEBUG) {
        console.log(
          "[kanework] " +
          field +
          " <- " +
          JSON.stringify(
            (labelFor(el) || [])[0] || ""
          ) +
          " = " +
          JSON.stringify(
            values[field]
          )
        );
      }
    }

    return values;
  }

  /* ================================================================
     AUTO FILL APPROVED COLORS
     ================================================================ */

  var lastJacket = null;
  var lastOrg = null;
  var seeded = false;
  var applying = false;

  function controlsFor(field) {
    var out = [];

    var els =
      document.querySelectorAll(
        "select"
      );

    for (var i = 0; i < els.length; i++) {
      if (
        fieldFor(els[i]) === field
      ) {
        out.push(els[i]);
      }
    }

    return out;
  }

  function setSelect(el, wanted) {
    if (!el || !wanted) {
      return false;
    }

    var target =
      norm(wanted);

    for (
      var i = 0;
      i < el.options.length;
      i++
    ) {
      if (
        norm(
          el.options[i].text
        ) !== target
      ) {
        continue;
      }

      if (
        el.selectedIndex === i
      ) {
        return true;
      }

      el.selectedIndex = i;

      el.dispatchEvent(
        new Event(
          "input",
          {
            bubbles: true
          }
        )
      );

      el.dispatchEvent(
        new Event(
          "change",
          {
            bubbles: true
          }
        )
      );

      return true;
    }

    if (KWP_DEBUG) {
      console.log(
        "[kanework] no option named " +
        JSON.stringify(wanted) +
        " in that dropdown"
      );
    }

    return false;
  }

  function autoFill() {
    if (applying) {
      return;
    }

    var values =
      collect();

    var jacket =
      values.jacket || null;

    var org =
      values.front_org &&
      values.front_org !== "NONE"
        ? values.front_org
        : null;

    if (!seeded) {
      seeded = true;
      lastJacket = jacket;
      lastOrg = org;
      return;
    }

    if (!jacket || !org) {
      lastJacket = jacket;
      lastOrg = org;
      return;
    }

    if (
      jacket === lastJacket &&
      org === lastOrg
    ) {
      return;
    }

    lastJacket = jacket;
    lastOrg = org;

    var combo =
      recommended(
        org,
        jacket
      );

    if (!combo) {
      return;
    }

    if (KWP_DEBUG) {
      console.log(
        "[kanework] " +
        org +
        " on " +
        jacket +
        " -> " +
        combo[0] +
        " letters, " +
        combo[1] +
        " outline"
      );
    }

    applying = true;

    try {
      var pairs = [
        [
          "letter",
          combo[0]
        ],
        [
          "number_color",
          combo[0]
        ],
        [
          "outline",
          combo[1]
        ],
        [
          "number_outline",
          combo[1]
        ]
      ];

      for (
        var i = 0;
        i < pairs.length;
        i++
      ) {
        var controls =
          controlsFor(
            pairs[i][0]
          );

        for (
          var j = 0;
          j < controls.length;
          j++
        ) {
          setSelect(
            controls[j],
            pairs[i][1]
          );
        }
      }
    }

    finally {
      applying = false;
    }
  }

  /* ================================================================
     FIND PREVIEW IFRAME
     ================================================================ */

  function frame() {
    var frames =
      document.getElementsByTagName(
        "iframe"
      );

    for (
      var i = 0;
      i < frames.length;
      i++
    ) {
      var src =
        frames[i].getAttribute("src") || "";

      if (
        src.indexOf(
          PREVIEW_HOST
        ) !== -1
      ) {
        return frames[i];
      }
    }

    return null;
  }

  /* ================================================================
     SEND ECWID OPTIONS TO PREVIEW
     ================================================================ */

  function send() {
    try {
      autoFill();
    }

    catch (e) {
      if (KWP_DEBUG) {
        console.log(
          "[kanework] autofill failed",
          e
        );
      }
    }

    var f =
      frame();

    if (
      !f ||
      !f.contentWindow
    ) {
      return;
    }

    var values =
      collect();

    if (KWP_DEBUG) {
      console.log(
        "[kanework] sending",
        values
      );
    }

    /* --------------------------------------------------------------
       SMALL DEBUG READOUT
       -------------------------------------------------------------- */

    try {
      var tag =
        document.getElementById(
          "kwp-readout"
        );

      if (!tag) {
        tag =
          document.createElement(
            "div"
          );

        tag.id =
          "kwp-readout";

        tag.style.cssText =
          "font:11px system-ui,sans-serif;color:#999;margin:4px 0;";

        var fr =
          frame();

        if (
          fr &&
          fr.parentNode
        ) {
          fr.parentNode.insertBefore(
            tag,
            fr
          );
        }
      }

      tag.textContent =
        "preview v15 - jacket: " +
        (
          values.jacket ||
          "(none read)"
        );

      // STOLE DEBUG TEXT
      if (
        values.stole_tl ||
        values.stole_tr ||
        values.stole_bl ||
        values.stole_br
      ) {
        tag.textContent +=
          " | TL: " +
          (values.stole_tl || "") +
          " | TR: " +
          (values.stole_tr || "") +
          " | BL: " +
          (values.stole_bl || "") +
          " | BR: " +
          (values.stole_br || "");
      }
    }

    catch (e) {}

    /* --------------------------------------------------------------
       SEND VALUES WITHOUT RELOADING THE IFRAME
       -------------------------------------------------------------- */

    try {
      if (f.contentWindow) {
        f.contentWindow.postMessage(
          {
            type: "kanework-preview",
            values: values
          },
          "*"
        );
      }
    }

    catch (e) {
      if (KWP_DEBUG) {
        console.log(
          "[kanework] send failed",
          e
        );
      }
    }
  }

  var timer = null;

  function schedule(wait) {
    clearTimeout(timer);

    timer =
      setTimeout(
        send,
        wait === undefined
          ? 300
          : wait
      );
  }

  /* ================================================================
     WATCH ECWID FIELDS
     ================================================================ */

  document.addEventListener(
    "input",
    function () {
      schedule();
    },
    true
  );

  document.addEventListener(
    "change",
    function () {
      schedule();
    },
    true
  );

  /* ================================================================
     PREVIEW READY HANDSHAKE
     ================================================================ */

  window.addEventListener(
    "message",
    function (ev) {
      var d =
        ev.data;

      if (
        d &&
        d.type ===
          "kanework-preview-ready"
      ) {
        send();
      }
    }
  );

  /* ================================================================
     REMOVE PREVIEW IF NEEDED
     ================================================================ */

  function removePreview() {
    try {
      var f =
        document.querySelector(
          'iframe[data-kwp="1"]'
        );

      if (f) {
        var box =
          f.parentNode;

        (
          box &&
          box.parentNode
            ? box.parentNode
            : document.body
        ).removeChild(
          box || f
        );
      }
    }

    catch (e) {}
  }

  /* ================================================================
     INITIAL SEND
     ================================================================ */

  if (
    window.Ecwid &&
    Ecwid.OnPageLoaded
  ) {
    Ecwid.OnPageLoaded.add(
      function () {
        setTimeout(
          send,
          800
        );

        setTimeout(
          send,
          2500
        );
      }
    );
  }

  else {
    schedule(
      1500
    );
  }

})();
