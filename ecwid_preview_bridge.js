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
  // The FULL public host of the preview server. It MUST include the
  // machine name (desktop-rreq2p1) - the short "tail261222.ts.net" is
  // not a real address, which is what left the preview blank.
  var PREVIEW_HOST = "desktop-rreq2p1.tail261222.ts.net";

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
    "OUTLINE NUMBER": "number_outline",
    "ORGANIZATION LETTER ON FRONT": "front_org",
    "WORDING THRU LETTERS": "wording",
    "ADD NAME UNDER CREST": "crest_name_on",
    "NAME UNDER CREST": "crest_name",
    // A tee's printed name is sized by the SHIRT size.
    "SIZE": "size",
    // Duffle bags. The front text may name an organisation, in which
    // case its three Greek letters go on, or be any wording at all.
    "FREE NO CHARGE ORGANAZATION WORDING ON FRONT POCKET": "front_text",
    "ORGANAZATION WORDING ON FRONT POCKET": "front_text",
    "DO YOU WANT WORDING UNDER GREEK LETTERS": "crest_name_on",
    "CUSTOM WORDING UNDER": "crest_name",
    "ADD CREST SHIELD TO TOP OF BAG": "crest_on",
    // Satin and camo jackets - the crest is an optional add-on there
    // too. Ecwid may label it a few ways; all map to the same field.
    "ADD CREST SHIELD": "crest_on",
    "CREST SHIELD": "crest_on",
    "ADD CREST": "crest_on",
    "CREST": "crest_on",
  };

  // An organisation's code is its name with everything but the letters
  // taken out - "ZETA PHI BETA" becomes ZETAPHIBETA, which is what the
  // artwork folder calls it. Worked out rather than listed, so an org
  // added to the store works without editing this file; the list here
  // was written with eight of the nine in it and Phi Beta Sigma
  // silently drew nothing.
  //
  // The result still has to BE one of the orgs we hold artwork for -
  // ORG_FALLBACK below has all nine - so "OTHER (TYPE BELOW)" and
  // anything unrecognised come back as NONE and draw no Greek and no
  // crest, which is the intended answer for a custom organisation.
  function orgCode(raw) {
    var code = String(raw === null || raw === undefined ? "" : raw)
      .toUpperCase().replace(/[^A-Z]/g, "");
    return Object.prototype.hasOwnProperty.call(ORG_FALLBACK, code)
      ? code : "NONE";
  }

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
    "OTHER TYPE BELOW": 1
  };

  // NONE is NOT in that list. It is a real answer - no outline at all -
  // and the preview draws it. It only means anything on the two outline
  // dropdowns, so it is not passed on from any other field.
  var OUTLINE_FIELDS = { outline: 1, number_outline: 1 };

  // The four the preview can recommend a colour for. The line number
  // takes the same pair as the lettering - one order, one look.
  var AUTO_FIELDS = { letter: 1, outline: 1,
                      number_color: 1, number_outline: 1 };

  // "Nothing chosen yet" - as opposed to OTHER, which IS a choice, just
  // not one with a colour attached.
  var NOT_CHOSEN = { "": 1, "PLEASE CHOOSE": 1, "PLEASE SELECT": 1,
                     "CHOOSE": 1 };

  /* ---- what each org sews on each jacket ---------------------------
   * The same table the preview uses, and the same one the customizer
   * shows as its approved combos. It lives here as well because THIS is
   * the copy that fills the store's own dropdowns, so the order carries
   * the colours rather than only the picture showing them.
   *
   * "gold" is YELLOW for Sigma Gamma Rho and Iota Phi Theta; Alpha and
   * Omega use OLD GOLD. Different threads, easy to confuse.
   */
  var APPROVED = {
    ALPHAKAPPAALPHA: {
      BLACK: ["GREEN", "PINK"], WHITE: ["PINK", "GREEN"],
      PINK: ["PINK", "GREEN"], GREEN: ["GREEN", "PINK"],
      KHAKI: ["PINK", "GREEN"], "HOT PINK": ["HOT PINK", "GREEN"]
    },
    DELTASIGMATHETA: {
      BLACK: ["RED", "WHITE"], WHITE: ["WHITE", "RED"],
      RED: ["RED", "WHITE"], CRIMSON: ["CRIMSON", "KHAKI"],
      KHAKI: ["RED", "WHITE"], MAROON: ["CRIMSON", "KHAKI"]
    },
    ZETAPHIBETA: {
      BLACK: ["BLUE", "WHITE"], WHITE: ["WHITE", "BLUE"],
      BLUE: ["BLUE", "WHITE"], KHAKI: ["BLUE", "WHITE"]
    },
    SIGMAGAMMARHO: {
      WHITE: ["YELLOW", "BLUE"], BLACK: ["BLUE", "YELLOW"],
      YELLOW: ["YELLOW", "BLUE"], BLUE: ["BLUE", "YELLOW"],
      KHAKI: ["BLUE", "YELLOW"]
    },
    ALPHAPHIALPHA: {
      BLACK: ["BLACK", "OLD GOLD"], WHITE: ["OLD GOLD", "BLACK"],
      KHAKI: ["OLD GOLD", "BLACK"]
    },
    KAPPAALPHAPSI: {
      WHITE: ["WHITE", "RED"], RED: ["RED", "WHITE"],
      BLACK: ["RED", "WHITE"], CRIMSON: ["CRIMSON", "KHAKI"],
      KHAKI: ["RED", "WHITE"], MAROON: ["CRIMSON", "KHAKI"]
    },
    OMEGAPSIPHI: { PURPLE: ["PURPLE", "OLD GOLD"] },
    PHIBETASIGMA: {
      WHITE: ["WHITE", "BLUE"], BLACK: ["BLUE", "WHITE"],
      BLUE: ["BLUE", "WHITE"], KHAKI: ["BLUE", "WHITE"]
    },
    IOTAPHITHETA: {
      BROWN: ["BROWN", "YELLOW"], YELLOW: ["YELLOW", "BROWN"],
      KHAKI: ["YELLOW", "BROWN"]
    }
  };

  // When an org has no combo for the jacket picked, its signature pair.
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

  // What a garment colour is, as a plain colour. The combos above are
  // keyed on plain colours, while the dropdown now holds things like
  // "TEE TRUE ROYAL" and "BLACK/WHITE" that match none of them.
  var BASE_COLOUR = {
    "ROYAL": "BLUE", "TRUE ROYAL": "BLUE", "CAROLINA BLUE": "BLUE",
    "COOL BLUE": "BLUE", "COLUMBIA": "BLUE", "AQUA": "BLUE",
    "KELLY": "GREEN", "SAGE": "GREEN", "MAIZE YELLOW": "YELLOW",
    "CARDINAL": "CRIMSON", "FUCHSIA": "HOT PINK",
    "TEAM PURPLE": "PURPLE", "NATURAL": "KHAKI", "TAN": "KHAKI",
    "CREAM": "KHAKI", "ASH": "GREY", "GRAY": "GREY",
    "WOODLAND": "KHAKI"
  };

  var GARMENT_PREFIX = ["SATIN ", "TEE ", "DUFFLE ", "CAMO ", "HOODIE ",
                        "SWEATSHIRT ", "CARDIGAN ", "POLO ", "STOLE "];

  function baseColour(name) {
    var text = String(name === null || name === undefined ? "" : name)
      .trim().toUpperCase();

    // A satin jacket is named body/trim - the body carries the letters.
    if (text.indexOf("/") !== -1) text = text.split("/")[0];

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
    if (byJacket && byJacket[plain]) return byJacket[plain];
    return ORG_FALLBACK[org] || null;
  }

  function norm(s) {
    return String(s === null || s === undefined ? "" : s)
      .replace(/[\u2018\u2019\u201c\u201d]/g, "")
      .replace(/[^A-Za-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }

  // Colours are normalised the same way, but the SLASH is kept - it is
  // what tells a satin "BLUE/WHITE" apart from a coach "BLUE". Stripping
  // it (as norm does) turned every satin colour into "BLUE WHITE",
  // which matched nothing and left the preview on the default coach
  // jacket. Also drop any trailing price or note in brackets, e.g.
  // "BLUE/WHITE (+$5.00)" -> "BLUE/WHITE".
  function normColour(s) {
    return String(s === null || s === undefined ? "" : s)
      .replace(/[\u2018\u2019\u201c\u201d]/g, "")
      .replace(/\([^)]*\)/g, " ")          // drop "(...)" price/notes
      .replace(/[^A-Za-z0-9\/]+/g, " ")    // keep the slash
      .replace(/\s*\/\s*/g, "/")           // tidy " / " -> "/"
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

  // Returns EVERY candidate label for a control, nearest first.
  function labelFor(el) {
    var out = [];

    // A <label for=...> is a CANDIDATE, not the answer. On a radio it
    // names the button - "NO" - while the question it belongs to sits
    // two levels above. Returning it and stopping is what made the
    // radio groups invisible, so it goes on the list and the search
    // carries on upwards.
    if (el.id) {
      var byFor = null;
      try {
        byFor = document.querySelector(
          'label[for="' + el.id.replace(/"/g, '\\"') + '"]');
      } catch (e) { byFor = null; }
      if (byFor) out.push(norm(textWithoutControls(byFor)));
    }

    var wrap = el.closest ? el.closest("label") : null;
    if (wrap) out.push(norm(textWithoutControls(wrap)));

    // EVERY level up, not just the first one with words in it. A radio
    // group is why: each button's own label says "NO" or "YES", and the
    // name of the question - "Wording thru Letters" - only appears one
    // or two levels above that. Stopping at the first non-empty
    // ancestor found "NO" and gave up.
    var node = el.parentElement;
    var hops = 0;
    while (node && hops < 6) {
      var text = norm(textWithoutControls(node));
      if (text) out.push(text);
      node = node.parentElement;
      hops++;
    }
    return out;
  }

  function matchLabel(label) {
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

  function fieldFor(el) {
    var aria = el.getAttribute && el.getAttribute("aria-label");
    if (aria) {
      var byAria = matchLabel(norm(aria));
      if (byAria) return byAria;
    }

    // Nearest level first, so the closest label wins over a wrapper
    // that happens to contain several.
    var levels = labelFor(el);
    for (var i = 0; i < levels.length; i++) {
      var hit = matchLabel(levels[i]);
      if (hit) return hit;
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
        var name = normColour(raw);

        // Nothing chosen means "use what this organisation usually
        // sews on this jacket" - AUTO - rather than holding whatever
        // was showing before. The line number follows the lettering.
        if (AUTO_FIELDS[field] && NOT_CHOSEN[name]) {
          values[field] = "AUTO";
          continue;
        }

        if (NOT_A_COLOUR[name]) continue;      // leave the last colour
        if (name === "NONE" && !OUTLINE_FIELDS[field]) continue;
        if (COLOUR_ALIAS[name]) name = COLOUR_ALIAS[name];
        values[field] = name;

      } else if (field === "front_org") {
        // NONE is sent deliberately when the customer picks OTHER or
        // has not chosen: no Greek and no crest, rather than leaving
        // the last organisation's artwork on a jacket nobody ordered.
        values[field] = orgCode(raw);

      } else if (field === "wording" || field === "crest_name_on"
                 || field === "crest_on") {
        // The store's value carries its price - "YES (+$25.00)".
        values[field] = (norm(raw).indexOf("YES") === 0) ? "YES" : "NO";

      } else {
        values[field] = String(raw).trim();
      }

      if (KWP_DEBUG) {
        console.log("[kanework] " + field + " <- " +
                    JSON.stringify((labelFor(el) || [])[0] || "") +
                    " = " + JSON.stringify(values[field]));
      }
    }
    return values;
  }

  /* ---- filling the store's own dropdowns ---------------------------
   * This is the part that changes the ORDER, not just the picture. When
   * the customer picks a jacket colour or an organisation, the four
   * lettering colours are set to the combination that org sews on that
   * jacket - the same one the customizer would show.
   *
   * It only fires when the JACKET or the ORG changes. A colour the
   * customer sets by hand afterwards is left alone until they change
   * one of those two again, so a deliberate choice is never quietly
   * overwritten.
   */
  var lastJacket = null;
  var lastOrg = null;
  var seeded = false;        // has the opening state been noted yet?
  var applying = false;      // our own writes must not retrigger this

  function controlsFor(field) {
    var out = [];
    var els = document.querySelectorAll("select");
    for (var i = 0; i < els.length; i++) {
      if (fieldFor(els[i]) === field) out.push(els[i]);
    }
    return out;
  }

  function setSelect(el, wanted) {
    if (!el || !wanted) return false;

    var target = norm(wanted);
    for (var i = 0; i < el.options.length; i++) {
      if (norm(el.options[i].text) !== target) continue;

      if (el.selectedIndex === i) return true;   // already right

      el.selectedIndex = i;

      // Ecwid listens for these to put the choice on the order. Setting
      // .value alone changes what is on screen and nothing else.
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }

    if (KWP_DEBUG) {
      console.log("[kanework] no option named " + JSON.stringify(wanted) +
                  " in that dropdown - left as it was");
    }
    return false;
  }

  function autoFill() {
    if (applying) return;

    var values = collect();
    var jacket = values.jacket || null;
    var org = values.front_org && values.front_org !== "NONE"
      ? values.front_org : null;

    // The FIRST look only notes what is already there. A customer who
    // comes back to a part-filled page - or whose page Ecwid rebuilds
    // mid-order - keeps the colours they chose; without this, the first
    // run would treat their own selections as a change and overwrite
    // them.
    if (!seeded) {
      seeded = true;
      lastJacket = jacket;
      lastOrg = org;
      return;
    }

    // Nothing to go on, or nothing has changed.
    if (!jacket || !org) { lastJacket = jacket; lastOrg = org; return; }
    if (jacket === lastJacket && org === lastOrg) return;

    lastJacket = jacket;
    lastOrg = org;

    var combo = recommended(org, jacket);
    if (!combo) return;

    if (KWP_DEBUG) {
      console.log("[kanework] " + org + " on " + jacket + " -> " +
                  combo[0] + " letters, " + combo[1] + " outline");
    }

    applying = true;
    try {
      // Letters and the line number take the letter colour; both
      // outlines take the outline colour.
      var pairs = [["letter", combo[0]], ["number_color", combo[0]],
                   ["outline", combo[1]], ["number_outline", combo[1]]];
      for (var i = 0; i < pairs.length; i++) {
        var controls = controlsFor(pairs[i][0]);
        for (var j = 0; j < controls.length; j++) {
          setSelect(controls[j], pairs[i][1]);
        }
      }
    } finally {
      applying = false;
    }
  }

  /* ---- sending them to the preview --------------------------------- */

  function frame() {
    var frames = document.getElementsByTagName("iframe");
    for (var i = 0; i < frames.length; i++) {
      var src = frames[i].getAttribute("src") || "";
      if (src.indexOf(PREVIEW_HOST) !== -1
          || frames[i].getAttribute("data-kwp") === "1") {
        return frames[i];
      }
    }

    // None on the page - CREATE it. This means the iframe does not have
    // to be pasted into the Ecwid description (Ecwid can strip it). The
    // bridge builds the preview itself, placed after the product's
    // option fields.
    try {
      var host = document.createElement("div");
      host.style.cssText = "margin:16px 0";

      var title = document.createElement("div");
      title.textContent = "Live Jacket Preview";
      title.style.cssText =
        "font:600 15px system-ui,sans-serif;margin:0 0 6px;color:#111";
      host.appendChild(title);

      var f = document.createElement("iframe");
      f.setAttribute("data-kwp", "1");
      f.setAttribute("loading", "lazy");
      f.src = "https://" + PREVIEW_HOST + "/";
      f.style.cssText = "width:100%;height:900px;border:0";
      host.appendChild(f);

      // Put it after the product's option form if we can find it,
      // otherwise at the end of the product details.
      var anchor =
        document.querySelector(".ec-store__product-details") ||
        document.querySelector(".product-details") ||
        document.querySelector("[class*='product']") ||
        document.body;
      anchor.appendChild(host);

      return f;
    } catch (e) {
      if (KWP_DEBUG) console.log("[kanework] could not create frame", e);
      return null;
    }
  }

  function send() {
    // Set the store's own dropdowns FIRST, so the picture and the order
    // agree - the values collected below are read after any auto-fill.
    try {
      autoFill();
    } catch (e) {
      if (KWP_DEBUG) console.log("[kanework] autofill failed", e);
    }

    var f = frame();
    if (!f || !f.contentWindow) return;

    var values = collect();
    if (KWP_DEBUG) console.log("[kanework] sending", values);

    // A tiny on-screen readout so you can SEE what the bridge is
    // reading without opening the console. Shows the jacket colour it
    // is about to send and a version stamp - if the stamp is old, the
    // browser is serving a cached bridge and needs a hard refresh.
    try {
      var tag = document.getElementById("kwp-readout");
      if (!tag) {
        tag = document.createElement("div");
        tag.id = "kwp-readout";
        tag.style.cssText =
          "font:11px system-ui,sans-serif;color:#999;margin:4px 0;";
        var fr = frame();
        if (fr && fr.parentNode) fr.parentNode.insertBefore(tag, fr);
      }
      tag.textContent = "preview v6 - jacket: " +
        (values.jacket || "(none read)");
    } catch (e) {}

    // Send the values BOTH ways:
    //  1) postMessage - the smooth path, if the iframe acts on it.
    //  2) the iframe URL - proven to draw (opening the preview with
    //     ?jacket=... shows the jacket). This is the reliable path and
    //     is what makes the picture actually appear. It only changes
    //     the src when the values changed, so it does not reload on
    //     every message.
    try {
      var qs = [];
      for (var k in values) {
        if (!values.hasOwnProperty(k)) continue;
        qs.push(encodeURIComponent(k) + "=" +
                encodeURIComponent(values[k]));
      }
      var base = "https://" + PREVIEW_HOST + "/";
      var newSrc = base + (qs.length ? "?" + qs.join("&") : "");

      if (f.getAttribute("data-kwp-src") !== newSrc) {
        // REPLACE the iframe rather than change its src. Some embed
        // contexts (Ecwid's storefront) ignore a src change on an
        // existing iframe, which left the frame blank. Building a fresh
        // iframe with the URL already in it always loads.
        var repl = document.createElement("iframe");
        repl.src = newSrc;
        repl.setAttribute("data-kwp", "1");
        repl.setAttribute("data-kwp-src", newSrc);
        repl.setAttribute("loading", "lazy");
        // Carry over the look of the original frame.
        repl.style.cssText = f.style.cssText ||
          "width:100%;height:900px;border:0";
        if (f.getAttribute("style"))
          repl.setAttribute("style", f.getAttribute("style"));
        f.parentNode.replaceChild(repl, f);
      }
    } catch (e) {
      if (KWP_DEBUG) console.log("[kanework] url set failed", e);
    }

    // No postMessage needed - the URL carries the values - but harmless
    // to leave for the direct (non-embedded) page.
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
