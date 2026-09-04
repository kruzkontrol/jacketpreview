/* ============================================================
   KANEWORK / GREEK KUSTOMS
   ECWID LIVE JACKET PREVIEW BRIDGE
   ============================================================ */

(function () {
  "use strict";

  var KWP_DEBUG = false;

  /* ============================================================
     PUBLIC PREVIEW SERVER
     ============================================================ */

  var PREVIEW_HOST = "desktop-rreq2p1.tail261222.ts.net";
  var PREVIEW_URL = "https://" + PREVIEW_HOST + "/";


  /* ============================================================
     ECWID OPTION -> PREVIEW FIELD
     ============================================================ */

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
    "OUTLINE NUMBER": "number_outline",

    "ORGANIZATION LETTER ON FRONT": "front_org",

    "WORDING THRU LETTERS": "wording",

    "ADD NAME UNDER CREST": "crest_name_on",
    "NAME UNDER CREST": "crest_name",

    "SIZE": "size",

    /* Duffle bag options */

    "FREE NO CHARGE ORGANAZATION WORDING ON FRONT POCKET":
      "front_text",

    "ORGANAZATION WORDING ON FRONT POCKET":
      "front_text",

    "DO YOU WANT WORDING UNDER GREEK LETTERS":
      "crest_name_on",

    "CUSTOM WORDING UNDER":
      "crest_name",

    "ADD CREST SHIELD TO TOP OF BAG":
      "crest_on",

    "ADD CREST SHIELD":
      "crest_on",

    "CREST SHIELD":
      "crest_on",

    "ADD CREST":
      "crest_on",

    "CREST":
      "crest_on"
  };


  /* ============================================================
     ORGANIZATION FALLBACK COLORS
     ============================================================ */

  var ORG_FALLBACK = {

    ALPHAKAPPAALPHA:
      ["PINK", "GREEN"],

    DELTASIGMATHETA:
      ["WHITE", "RED"],

    ZETAPHIBETA:
      ["WHITE", "BLUE"],

    SIGMAGAMMARHO:
      ["YELLOW", "BLUE"],

    ALPHAPHIALPHA:
      ["OLD GOLD", "BLACK"],

    KAPPAALPHAPSI:
      ["WHITE", "CRIMSON"],

    OMEGAPSIPHI:
      ["OLD GOLD", "PURPLE"],

    PHIBETASIGMA:
      ["WHITE", "BLUE"],

    IOTAPHITHETA:
      ["YELLOW", "BROWN"]
  };


  function orgCode(raw) {

    var code = String(
      raw === null ||
      raw === undefined
        ? ""
        : raw
    )
      .toUpperCase()
      .replace(/[^A-Z]/g, "");


    return Object.prototype.hasOwnProperty.call(
      ORG_FALLBACK,
      code
    )
      ? code
      : "NONE";
  }


  /* ============================================================
     COLOR FIELDS
     ============================================================ */

  var COLOUR_FIELDS = {

    jacket: 1,
    letter: 1,
    outline: 1,

    number_color: 1,
    number_outline: 1
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


  var NOT_CHOSEN = {

    "": 1,

    "PLEASE CHOOSE": 1,
    "PLEASE SELECT": 1,

    "CHOOSE": 1
  };


  /* ============================================================
     APPROVED ORGANIZATION COLOR COMBINATIONS
     ============================================================ */

  var APPROVED = {

    ALPHAKAPPAALPHA: {

      BLACK:
        ["GREEN", "PINK"],

      WHITE:
        ["PINK", "GREEN"],

      PINK:
        ["PINK", "GREEN"],

      GREEN:
        ["GREEN", "PINK"],

      KHAKI:
        ["PINK", "GREEN"],

      "HOT PINK":
        ["HOT PINK", "GREEN"]
    },


    DELTASIGMATHETA: {

      BLACK:
        ["RED", "WHITE"],

      WHITE:
        ["WHITE", "RED"],

      RED:
        ["RED", "WHITE"],

      CRIMSON:
        ["CRIMSON", "KHAKI"],

      KHAKI:
        ["RED", "WHITE"],

      MAROON:
        ["CRIMSON", "KHAKI"]
    },


    ZETAPHIBETA: {

      BLACK:
        ["BLUE", "WHITE"],

      WHITE:
        ["WHITE", "BLUE"],

      BLUE:
        ["BLUE", "WHITE"],

      KHAKI:
        ["BLUE", "WHITE"]
    },


    SIGMAGAMMARHO: {

      WHITE:
        ["YELLOW", "BLUE"],

      BLACK:
        ["BLUE", "YELLOW"],

      YELLOW:
        ["YELLOW", "BLUE"],

      BLUE:
        ["BLUE", "YELLOW"],

      KHAKI:
        ["BLUE", "YELLOW"]
    },


    ALPHAPHIALPHA: {

      BLACK:
        ["BLACK", "OLD GOLD"],

      WHITE:
        ["OLD GOLD", "BLACK"],

      KHAKI:
        ["OLD GOLD", "BLACK"]
    },


    KAPPAALPHAPSI: {

      WHITE:
        ["WHITE", "RED"],

      RED:
        ["RED", "WHITE"],

      BLACK:
        ["RED", "WHITE"],

      CRIMSON:
        ["CRIMSON", "KHAKI"],

      KHAKI:
        ["RED", "WHITE"],

      MAROON:
        ["CRIMSON", "KHAKI"]
    },


    OMEGAPSIPHI: {

      PURPLE:
        ["PURPLE", "OLD GOLD"]
    },


    PHIBETASIGMA: {

      WHITE:
        ["WHITE", "BLUE"],

      BLACK:
        ["BLUE", "WHITE"],

      BLUE:
        ["BLUE", "WHITE"],

      KHAKI:
        ["BLUE", "WHITE"]
    },


    IOTAPHITHETA: {

      BROWN:
        ["BROWN", "YELLOW"],

      YELLOW:
        ["YELLOW", "BROWN"],

      KHAKI:
        ["YELLOW", "BROWN"]
    }
  };


  /* ============================================================
     GARMENT BASE COLORS
     ============================================================ */

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
      name === null ||
      name === undefined
        ? ""
        : name
    )
      .trim()
      .toUpperCase();


    if (
      text.indexOf("/") !== -1
    ) {

      text =
        text.split("/")[0];
    }


    for (
      var i = 0;
      i < GARMENT_PREFIX.length;
      i++
    ) {

      if (
        text.indexOf(
          GARMENT_PREFIX[i]
        ) === 0
      ) {

        text =
          text.slice(
            GARMENT_PREFIX[i].length
          );

        break;
      }
    }


    text =
      text
        .replace(/\s+/g, " ")
        .trim();


    return (
      BASE_COLOUR[text] ||
      text
    );
  }


  function recommended(
    org,
    jacket
  ) {

    if (!org) {

      return null;
    }


    var byJacket =
      APPROVED[org];


    var plain =
      baseColour(jacket);


    if (
      byJacket &&
      byJacket[plain]
    ) {

      return byJacket[plain];
    }


    return (
      ORG_FALLBACK[org] ||
      null
    );
  }


  /* ============================================================
     NORMALIZATION
     ============================================================ */

  function norm(s) {

    return String(
      s === null ||
      s === undefined
        ? ""
        : s
    )

      .replace(
        /[\u2018\u2019\u201c\u201d]/g,
        ""
      )

      .replace(
        /[^A-Za-z0-9]+/g,
        " "
      )

      .replace(
        /\s+/g,
        " "
      )

      .trim()

      .toUpperCase();
  }


  function normColour(s) {

    return String(
      s === null ||
      s === undefined
        ? ""
        : s
    )

      .replace(
        /[\u2018\u2019\u201c\u201d]/g,
        ""
      )

      .replace(
        /\([^)]*\)/g,
        " "
      )

      .replace(
        /[^A-Za-z0-9\/]+/g,
        " "
      )

      .replace(
        /\s*\/\s*/g,
        "/"
      )

      .replace(
        /\s+/g,
        " "
      )

      .trim()

      .toUpperCase();
  }


  /* ============================================================
     GET LABEL TEXT WITHOUT INPUT CONTROLS
     ============================================================ */

  function textWithoutControls(node) {

    if (!node) {

      return "";
    }


    var copy =
      node.cloneNode(true);


    var junk =
      copy.querySelectorAll(
        "input," +
        "select," +
        "textarea," +
        "option," +
        "button," +
        "script," +
        "style," +
        "img," +
        "svg"
      );


    for (
      var i = 0;
      i < junk.length;
      i++
    ) {

      if (
        junk[i].parentNode
      ) {

        junk[i]
          .parentNode
          .removeChild(
            junk[i]
          );
      }
    }


    return (
      copy.textContent ||
      ""
    );
  }


  /* ============================================================
     FIND ECWID OPTION LABEL
     ============================================================ */

  function labelFor(el) {

    var out = [];


    if (el.id) {

      var byFor = null;


      try {

        byFor =
          document.querySelector(
            'label[for="' +
            el.id.replace(
              /"/g,
              '\\"'
            ) +
            '"]'
          );

      } catch (e) {

        byFor = null;
      }


      if (byFor) {

        out.push(
          norm(
            textWithoutControls(
              byFor
            )
          )
        );
      }
    }


    var wrap =
      el.closest
        ? el.closest("label")
        : null;


    if (wrap) {

      out.push(
        norm(
          textWithoutControls(
            wrap
          )
        )
      );
    }


    var node =
      el.parentElement;


    var hops = 0;


    while (
      node &&
      hops < 7
    ) {

      var text =
        norm(
          textWithoutControls(
            node
          )
        );


      if (text) {

        out.push(text);
      }


      node =
        node.parentElement;

      hops++;
    }


    return out;
  }


  /* ============================================================
     MATCH LABEL
     ============================================================ */

  function matchLabel(label) {

    if (!label) {

      return null;
    }


    if (
      FIELDS[label]
    ) {

      return FIELDS[label];
    }


    if (
      label.length <= 100
    ) {

      var best = null;


      for (
        var key in FIELDS
      ) {

        if (
          !Object.prototype
            .hasOwnProperty
            .call(
              FIELDS,
              key
            )
        ) {

          continue;
        }


        if (
          label.indexOf(
            key
          ) === -1
        ) {

          continue;
        }


        if (
          best === null ||
          key.length >
          best.length
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

    if (!el) {

      return null;
    }


    var aria =
      el.getAttribute
        ? el.getAttribute(
            "aria-label"
          )
        : null;


    if (aria) {

      var byAria =
        matchLabel(
          norm(aria)
        );


      if (byAria) {

        return byAria;
      }
    }


    var levels =
      labelFor(el);


    for (
      var i = 0;
      i < levels.length;
      i++
    ) {

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


  /* ============================================================
     READ CONTROL VALUE
     ============================================================ */

  function valueOf(el) {

    if (
      el.type === "radio"
    ) {

      return el.checked
        ? el.value
        : null;
    }


    if (
      el.type === "checkbox"
    ) {

      return el.checked
        ? el.value
        : null;
    }


    return el.value;
  }


  /* ============================================================
     COLLECT ECWID PRODUCT OPTIONS
     ============================================================ */

  function collect() {

    var values = {};


    var els =
      document.querySelectorAll(
        "input," +
        "select," +
        "textarea"
      );


    for (
      var i = 0;
      i < els.length;
      i++
    ) {

      var el =
        els[i];


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


      if (
        raw === null
      ) {

        continue;
      }


      if (
        COLOUR_FIELDS[field]
      ) {

        var name =
          normColour(raw);


        if (
          AUTO_FIELDS[field] &&
          NOT_CHOSEN[name]
        ) {

          values[field] =
            "AUTO";

          continue;
        }


        if (
          NOT_A_COLOUR[name]
        ) {

          continue;
        }


        if (
          name === "NONE" &&
          !OUTLINE_FIELDS[field]
        ) {

          continue;
        }


        if (
          COLOUR_ALIAS[name]
        ) {

          name =
            COLOUR_ALIAS[name];
        }


        values[field] =
          name;
      }


      else if (
        field === "front_org"
      ) {

        values[field] =
          orgCode(raw);
      }


      else if (
        field === "wording" ||
        field === "crest_name_on" ||
        field === "crest_on"
      ) {

        values[field] =
          norm(raw)
            .indexOf("YES") === 0
            ? "YES"
            : "NO";
      }


      else {

        values[field] =
          String(raw)
            .trim();
      }


      if (
        KWP_DEBUG
      ) {

        console.log(
          "[Kanework] " +
          field +
          " = ",
          values[field]
        );
      }
    }


    return values;
  }


  /* ============================================================
     FIND ECWID SELECTS
     ============================================================ */

  function controlsFor(field) {

    var out = [];


    var els =
      document.querySelectorAll(
        "select"
      );


    for (
      var i = 0;
      i < els.length;
      i++
    ) {

      if (
        fieldFor(
          els[i]
        ) === field
      ) {

        out.push(
          els[i]
        );
      }
    }


    return out;
  }


  /* ============================================================
     SET ECWID SELECT
     ============================================================ */

  function setSelect(
    el,
    wanted
  ) {

    if (
      !el ||
      !wanted
    ) {

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


      el.selectedIndex =
        i;


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


    if (
      KWP_DEBUG
    ) {

      console.log(
        "[Kanework] no option named:",
        wanted
      );
    }


    return false;
  }


  /* ============================================================
     AUTO-FILL APPROVED COLORS
     ============================================================ */

  var lastJacket = null;

  var lastOrg = null;

  var seeded = false;

  var applying = false;


  function autoFill() {

    if (
      applying
    ) {

      return;
    }


    var values =
      collect();


    var jacket =
      values.jacket ||
      null;


    var org =
      values.front_org &&
      values.front_org !== "NONE"
        ? values.front_org
        : null;


    if (
      !seeded
    ) {

      seeded = true;

      lastJacket =
        jacket;

      lastOrg =
        org;

      return;
    }


    if (
      !jacket ||
      !org
    ) {

      lastJacket =
        jacket;

      lastOrg =
        org;

      return;
    }


    if (
      jacket === lastJacket &&
      org === lastOrg
    ) {

      return;
    }


    lastJacket =
      jacket;

    lastOrg =
      org;


    var combo =
      recommended(
        org,
        jacket
      );


    if (!combo) {

      return;
    }


    applying =
      true;


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

    } finally {

      applying =
        false;
    }
  }


  /* ============================================================
     FIND EXISTING PREVIEW FRAME
     ============================================================ */

  function frame() {

    var byId =
      document.getElementById(
        "kanework-preview-frame"
      );


    if (byId) {

      return byId;
    }


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
        frames[i]
          .getAttribute(
            "src"
          ) || "";


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


  /* ============================================================
     DETECT ECWID PRODUCT PAGE

     IMPORTANT:
     We DO NOT require Ecwid options to be recognized before
     creating the preview.
     ============================================================ */

  function isProductPage() {

    if (
      document.querySelector(
        ".ec-store__product-page"
      )
    ) {

      return true;
    }


    if (
      document.querySelector(
        ".product-details"
      )
    ) {

      return true;
    }


    if (
      document.querySelector(
        ".product-details__product-options"
      )
    ) {

      return true;
    }


    if (
      document.querySelector(
        ".details-product-options"
      )
    ) {

      return true;
    }


    /*
      Fallback:
      check for one of our known product options.
    */

    var controls =
      document.querySelectorAll(
        "input," +
        "select," +
        "textarea"
      );


    for (
      var i = 0;
      i < controls.length;
      i++
    ) {

      if (
        controls[i].type === "hidden" ||
        controls[i].type === "file"
      ) {

        continue;
      }


      if (
        fieldFor(
          controls[i]
        )
      ) {

        return true;
      }
    }


    return false;
  }


  /* ============================================================
     FIND WHERE TO PUT PREVIEW
     ============================================================ */

  function findPreviewMount() {

    var mount =
      document.querySelector(
        ".product-details__product-options"
      );


    if (mount) {

      return {
        type: "append",
        node: mount
      };
    }


    mount =
      document.querySelector(
        ".details-product-options"
      );


    if (mount) {

      return {
        type: "append",
        node: mount
      };
    }


    mount =
      document.querySelector(
        ".ec-store__product-page " +
        ".product-details__sidebar"
      );


    if (mount) {

      return {
        type: "append",
        node: mount
      };
    }


    /*
      Try placing after the last Kanework option.
    */

    var controls =
      document.querySelectorAll(
        "input," +
        "select," +
        "textarea"
      );


    var last =
      null;


    for (
      var i = 0;
      i < controls.length;
      i++
    ) {

      if (
        controls[i].type === "hidden" ||
        controls[i].type === "file"
      ) {

        continue;
      }


      if (
        fieldFor(
          controls[i]
        )
      ) {

        last =
          controls[i];
      }
    }


    if (last) {

      var wrap =
        last.closest
          ? last.closest(
              ".form-control," +
              ".form-control__inline-label," +
              ".details-product-option," +
              ".product-details__product-option"
            )
          : null;


      var anchor =
        wrap ||
        last.parentElement ||
        last;


      if (
        anchor &&
        anchor.parentNode
      ) {

        return {
          type: "after",
          node: anchor
        };
      }
    }


    /*
      Last fallback:
      product page itself.
    */

    mount =
      document.querySelector(
        ".ec-store__product-page"
      );


    if (mount) {

      return {
        type: "append",
        node: mount
      };
    }


    mount =
      document.querySelector(
        ".product-details"
      );


    if (mount) {

      return {
        type: "append",
        node: mount
      };
    }


    return null;
  }


  /* ============================================================
     CREATE LIVE JACKET PREVIEW
     ============================================================ */

  function ensureFrame() {

    var existing =
      frame();


    if (existing) {

      return existing;
    }


    if (
      !isProductPage()
    ) {

      return null;
    }


    var existingBox =
      document.getElementById(
        "kanework-preview-box"
      );


    if (
      existingBox
    ) {

      var existingFrame =
        existingBox.querySelector(
          "iframe"
        );


      if (
        existingFrame
      ) {

        return existingFrame;
      }


      if (
        existingBox.parentNode
      ) {

        existingBox
          .parentNode
          .removeChild(
            existingBox
          );
      }
    }


    var destination =
      findPreviewMount();


    if (
      !destination
    ) {

      return null;
    }


    /* ------------------------------------------------------------
       PREVIEW CONTAINER
       ------------------------------------------------------------ */

    var box =
      document.createElement(
        "div"
      );


    box.id =
      "kanework-preview-box";


    box.setAttribute(
      "data-kanework-preview",
      "true"
    );


    box.style.cssText =
      "display:block;" +
      "box-sizing:border-box;" +
      "width:100%;" +
      "max-width:980px;" +
      "margin:24px 0 12px 0;" +
      "padding:0;" +
      "clear:both;";


    /* ------------------------------------------------------------
       TITLE
       ------------------------------------------------------------ */

    var heading =
      document.createElement(
        "div"
      );


    heading.textContent =
      "Live Jacket Preview";


    heading.style.cssText =
      "display:block;" +
      "font-family:Arial,sans-serif;" +
      "font-size:20px;" +
      "font-weight:700;" +
      "line-height:1.3;" +
      "margin:0 0 10px 0;" +
      "padding:0;" +
      "color:#222;";


    box.appendChild(
      heading
    );


    /* ------------------------------------------------------------
       LOADING MESSAGE
       ------------------------------------------------------------ */

    var loading =
      document.createElement(
        "div"
      );


    loading.id =
      "kanework-preview-loading";


    loading.textContent =
      "Loading jacket preview...";


    loading.style.cssText =
      "font-family:Arial,sans-serif;" +
      "font-size:13px;" +
      "color:#777;" +
      "margin:0 0 6px 0;";


    box.appendChild(
      loading
    );


    /* ------------------------------------------------------------
       IFRAME
       ------------------------------------------------------------ */

    var iframe =
      document.createElement(
        "iframe"
      );


    iframe.id =
      "kanework-preview-frame";


    iframe.src =
      PREVIEW_URL;


    iframe.title =
      "Live Jacket Preview";


    iframe.loading =
      "eager";


    iframe.setAttribute(
      "scrolling",
      "no"
    );


    iframe.style.cssText =
      "display:block;" +
      "box-sizing:border-box;" +
      "width:100%;" +
      "min-height:760px;" +
      "height:760px;" +
      "margin:0;" +
      "padding:0;" +
      "border:1px solid #ddd;" +
      "border-radius:4px;" +
      "background:#fff;";


    iframe.addEventListener(
      "load",
      function () {

        var msg =
          document.getElementById(
            "kanework-preview-loading"
          );


        if (msg) {

          msg.style.display =
            "none";
        }


        setTimeout(
          send,
          100
        );
      }
    );


    box.appendChild(
      iframe
    );


    /* ------------------------------------------------------------
       INSERT PREVIEW
       ------------------------------------------------------------ */

    if (
      destination.type ===
      "after"
    ) {

      destination.node
        .parentNode
        .insertBefore(
          box,
          destination.node
            .nextSibling
        );

    } else {

      destination.node
        .appendChild(
          box
        );
    }


    if (
      KWP_DEBUG
    ) {

      console.log(
        "[Kanework] Live Jacket Preview inserted."
      );
    }


    return iframe;
  }


  /* ============================================================
     SEND PRODUCT OPTIONS TO PREVIEW
     ============================================================ */

  function send() {

    try {

      autoFill();

    } catch (e) {

      if (
        KWP_DEBUG
      ) {

        console.log(
          "[Kanework] autofill failed",
          e
        );
      }
    }


    var f =
      ensureFrame();


    if (
      !f ||
      !f.contentWindow
    ) {

      return;
    }


    var values =
      collect();


    if (
      KWP_DEBUG
    ) {

      console.log(
        "[Kanework] sending",
        values
      );
    }


    /*
      Small visible version/readout.

      This lets us tell whether Ecwid loaded the new bridge
      and whether the jacket field is being read.
    */

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
          "font:11px system-ui,sans-serif;" +
          "color:#999;" +
          "margin:4px 0;";


        var fr =
          frame();


        if (
          fr &&
          fr.parentNode
        ) {

          fr.parentNode
            .insertBefore(
              tag,
              fr
            );
        }
      }


      tag.textContent =
        "preview v4 - jacket: " +
        (
          values.jacket ||
          "(none read)"
        );


    } catch (e) {}


    try {

      f.contentWindow
        .postMessage(

          {
            type:
              "kanework-preview",

            values:
              values
          },

          "*"
        );


    } catch (e) {

      if (
        KWP_DEBUG
      ) {

        console.log(
          "[Kanework] send failed",
          e
        );
      }
    }
  }


  /* ============================================================
     DEBOUNCE
     ============================================================ */

  var timer =
    null;


  function schedule(wait) {

    clearTimeout(
      timer
    );


    timer =
      setTimeout(
        send,

        wait === undefined
          ? 300
          : wait
      );
  }


  /* ============================================================
     WATCH CUSTOMER CHANGES
     ============================================================ */

  document.addEventListener(
    "input",

    function () {

      schedule(150);
    },

    true
  );


  document.addEventListener(
    "change",

    function () {

      schedule(150);
    },

    true
  );


  /* ============================================================
     PREVIEW READY MESSAGE
     ============================================================ */

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


  /* ============================================================
     START PREVIEW
     ============================================================ */

  function startPreview() {

    /*
      Ecwid can load the product shell before the options.

      Multiple attempts make sure the preview appears once
      the product page is actually ready.
    */


    setTimeout(
      function () {

        ensureFrame();

        send();
      },

      250
    );


    setTimeout(
      function () {

        ensureFrame();

        send();
      },

      750
    );


    setTimeout(
      function () {

        ensureFrame();

        send();
      },

      1500
    );


    setTimeout(
      function () {

        ensureFrame();

        send();
      },

      3000
    );
  }


  /* ============================================================
     ECWID PAGE LOADED
     ============================================================ */

  if (
    window.Ecwid &&
    Ecwid.OnPageLoaded
  ) {

    Ecwid.OnPageLoaded.add(
      function () {

        startPreview();
      }
    );

  } else {

    if (
      document.readyState ===
      "loading"
    ) {

      document.addEventListener(
        "DOMContentLoaded",

        function () {

          startPreview();
        }
      );

    } else {

      startPreview();
    }
  }


  /* ============================================================
     ECWID SINGLE PAGE APP WATCHER
     ============================================================ */

  var domTimer =
    null;


  try {

    new MutationObserver(
      function () {

        clearTimeout(
          domTimer
        );


        domTimer =
          setTimeout(
            function () {

              if (
                isProductPage()
              ) {

                ensureFrame();

                schedule(50);
              }

            },

            250
          );
      }
    )
      .observe(

        document.documentElement,

        {
          childList: true,
          subtree: true
        }
      );


  } catch (e) {

    if (
      KWP_DEBUG
    ) {

      console.log(
        "[Kanework] MutationObserver failed",
        e
      );
    }
  }


  /* ============================================================
     FINAL STARTUP FALLBACK
     ============================================================ */

  window.addEventListener(
    "load",

    function () {

      setTimeout(
        function () {

          ensureFrame();

          send();
        },

        500
      );
    }
  );


})();
