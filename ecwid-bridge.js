/* =============================================================
   ECWID LIVE JACKET PREVIEW BRIDGE
   =============================================================
   What this does:
     - On the "PLATINUM LINE JACKET test" product page only,
       replace the static jacket photo with a live preview iframe
       pointing to the hosted customizer in preview mode.
     - Watch every relevant form field. When the customer types
       or selects something, send the updated state to the iframe
       via postMessage so the preview updates live.

   Where to paste this:
     Ecwid Admin → Settings → Design → Customize Design →
     JavaScript section. Save. Reload your test product page.

   To find which product page to activate on:
     The URL guard below looks for "platinum-line-jacket-test" in
     the URL path. If your test product slug is different,
     update the TEST_URL_FRAGMENT constant.
   ============================================================= */

(function () {
  'use strict';

  // ---------- CONFIG ----------
  // Only activate on URLs containing this fragment (case-insensitive).
  var TEST_URL_FRAGMENT = 'platinum-line-jacket-test';

  // URL where the live preview iframe loads from.
  var PREVIEW_IFRAME_URL =
    'https://kruzkontrol.github.io/jacketpreview/customizer.html?mode=preview';

  // Map Ecwid color-dropdown text → customizer hex code.
  // Add entries here as you discover new color names in your Ecwid dropdowns.
  var COLOR_NAME_TO_HEX = {
    'WHITE':    '#FFFFFF',
    'BLACK':    '#000000',
    'RED':      '#ED3237',
    'CRIMSON':  '#8B0000',
    'PINK':     '#F4C2D7',
    'HOT PINK': '#FF1493',
    'ORANGE':   '#FF8C00',
    'GOLD':     '#FFD700',
    'OLD GOLD': '#A47E3C',
    'KHAKI':    '#C3B091',
    'BROWN':    '#5D2E11',
    'GREEN':    '#0E7C3A',
    'BLUE':     '#003DA5',
    'ROYAL':    '#003DA5',
    'NAVY':     '#0B1F4D',
    'PURPLE':   '#5D3FD3',
    'GREY':     '#808080',
    'GRAY':     '#808080',
    'SILVER':   '#C0C0C0',
    'YELLOW':   '#FFEB00',
    'NONE':     ''
  };

  // Map Ecwid "Jacket color" dropdown text → customizer jacket id.
  // The jacket id matches the photo filenames in the GitHub repo
  // (e.g. "red" → uses jackets/red_front.jpg, jackets/red_back.jpg).
  var JACKET_COLOR_TO_ID = {
    'PINK':     'pink',
    'HOT PINK': 'hotpink',
    'RED':      'red',
    'CRIMSON':  'crimson',
    'ORANGE':   'orange',
    'GOLD':     'gold',
    'KHAKI':    'khaki',
    'BROWN':    'brown',
    'GREEN':    'green',
    'BLUE':     'blue',
    'PURPLE':   'purple',
    'BLACK':    'black',
    'GREY':     'grey',
    'GRAY':     'grey',
    'WHITE':    'white'
  };

  // Recognize known org names typed into "ORGANIZATION/LETTER ON FRONT".
  // If the text matches one of these (case-insensitive), the preview loads
  // that org's letters/shield. Otherwise the text shows as plain letters.
  var ORG_NAME_MATCHES = {
    'AKA': 'AKA', 'ALPHA KAPPA ALPHA': 'AKA',
    'APA': 'APA', 'ALPHA PHI ALPHA': 'APA',
    'DST': 'DST', 'DELTA SIGMA THETA': 'DST',
    'IPT': 'IPT', 'IOTA PHI THETA': 'IPT',
    'KAP': 'KAP', 'KAPPA ALPHA PSI': 'KAP', 'KAPPA': 'KAP',
    'OPP': 'OPP', 'OMEGA PSI PHI': 'OPP', 'OMEGA': 'OPP',
    'PBS': 'PBS', 'PHI BETA SIGMA': 'PBS',
    'SGR': 'SGR', 'SIGMA GAMMA RHO': 'SGR',
    'ZPB': 'ZPB', 'ZETA PHI BETA': 'ZPB'
  };

  // ---------- GUARDS ----------
  function isTargetProductPage() {
    var url = (window.location.href || '').toLowerCase();
    return url.indexOf(TEST_URL_FRAGMENT.toLowerCase()) !== -1;
  }

  // ---------- STATE ----------
  var iframe = null;            // The preview iframe element
  var iframeReady = false;      // Becomes true once the iframe posts back "previewReady"
  var pendingPayload = null;    // Latest payload that arrived before iframe was ready
  var observer = null;          // MutationObserver for re-binding after Ecwid re-renders

  // ---------- HELPERS ----------

  // Find a form field by visible label text. Ecwid renders option labels
  // as text near the input. We walk up from a matching label to its row,
  // then find the actual input inside that row.
  function findFieldByLabel(labelText) {
    var needle = labelText.trim().toLowerCase();
    // Try every element that might hold a label
    var candidates = document.querySelectorAll(
      '.product-details__product-option-name, .product-details__product-option label, ' +
      '.form-control__label, label, [class*="option-name"], [class*="OptionName"]'
    );
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      var text = (el.textContent || '').trim().toLowerCase();
      // Match exact or starts-with (some Ecwid labels include trailing colons or prices)
      if (text === needle || text.indexOf(needle) === 0) {
        // Walk up to find the option row, then look for the input within it
        var row = el.closest(
          '.product-details__product-option, .form-control, [class*="option"], [class*="Option"]'
        );
        if (!row) row = el.parentElement;
        if (row) {
          var input = row.querySelector(
            'input[type="text"], input[type="number"], textarea, select'
          );
          if (input) return input;
          // Radios: return the row itself so caller can read the selected radio
          var radio = row.querySelector('input[type="radio"]:checked');
          if (radio) return row;
        }
      }
    }
    return null;
  }

  // Read the current value of a field (handles text, select, radio rows).
  function readField(input) {
    if (!input) return '';
    if (input.nodeName === 'SELECT') {
      var opt = input.options[input.selectedIndex];
      return opt ? (opt.text || opt.value || '').trim() : '';
    }
    if (input.nodeName === 'INPUT' || input.nodeName === 'TEXTAREA') {
      return (input.value || '').trim();
    }
    // Radio row case
    var picked = input.querySelector('input[type="radio"]:checked');
    if (picked) {
      // Find the label text that goes with the picked radio
      var lbl = picked.closest('label') ||
                input.querySelector('label[for="' + picked.id + '"]');
      if (lbl) return (lbl.textContent || '').trim();
      return picked.value || '';
    }
    return '';
  }

  // Translate "YES (+$8.00)" or "NO" radio text → boolean
  function isYes(radioText) {
    var t = (radioText || '').trim().toUpperCase();
    return t.indexOf('YES') === 0;
  }

  // Translate color name from Ecwid dropdown → hex
  function colorToHex(name) {
    if (!name) return '';
    var key = name.trim().toUpperCase();
    return COLOR_NAME_TO_HEX[key] || '';
  }

  // Translate jacket color name → jacket id
  function jacketColorToId(name) {
    if (!name) return '';
    var key = name.trim().toUpperCase();
    return JACKET_COLOR_TO_ID[key] || '';
  }

  // Translate free-text org input → known org key (or empty if unknown)
  function matchOrgName(text) {
    if (!text) return '';
    var key = text.trim().toUpperCase();
    return ORG_NAME_MATCHES[key] || '';
  }

  // ---------- BUILD PAYLOAD ----------

  // Read all relevant form fields and build a state payload for the preview.
  function buildPayload() {
    var payload = {};

    // Jacket color
    var jacketField = findFieldByLabel('Jacket color');
    var jacketName = readField(jacketField);
    var jacketId = jacketColorToId(jacketName);
    if (jacketId) payload.jacket = jacketId;

    // Organization / letter on front
    var orgField = findFieldByLabel('ORGANIZATION/LETTER ON FRONT');
    var orgText = readField(orgField);
    var matchedOrg = matchOrgName(orgText);
    if (matchedOrg) {
      payload.org = matchedOrg;
    } else if (orgText) {
      // Not a known D9 org — preview as "OTHER" with the typed name shown later
      payload.org = 'OTHER';
    }

    // Add name under crest (YES/NO) → empty/non-empty
    var addNameRow = findFieldByLabel('ADD NAME UNDER CREST');
    var addNameYes = isYes(readField(addNameRow));
    var nameField = findFieldByLabel('NAME UNDER CREST');
    payload.nameUnderCrest = (addNameYes && nameField)
      ? (readField(nameField) || '')
      : '';

    // Wording thru letters
    var wordingRow = findFieldByLabel('Wording thru Letters');
    payload.cursiveOnFront = isYes(readField(wordingRow));

    // Text fields → state
    var mapText = [
      ['LINE NAME',              'motto'],
      ['LINE NUMBER',            'number'],
      ['SHIP (BOTTOM OF JACKET)','lineName'],
      ['CHAPTER',                'chapter'],
      ['CROSSING SEASON',        'season'],
      ['NECK LETTERING',         'neckInfo']
    ];
    mapText.forEach(function (pair) {
      var f = findFieldByLabel(pair[0]);
      payload[pair[1]] = readField(f) || '';
    });

    // Color dropdowns → hex
    var mapColor = [
      ['LETTER COLOR',       'textColor'],
      ['OUTLINE COLOR',      'outlineColor'],
      ['LINE NUMBER COLOR',  'numberTextColor'],
      ['OUTLINE NUMBER',     'numberOutlineColor']
    ];
    mapColor.forEach(function (pair) {
      var f = findFieldByLabel(pair[0]);
      var hex = colorToHex(readField(f));
      if (hex) payload[pair[1]] = hex;
    });

    return payload;
  }

  // ---------- SEND TO IFRAME ----------

  function sendUpdate() {
    if (!iframe) return;
    var payload = buildPayload();
    if (iframeReady) {
      iframe.contentWindow.postMessage({type: 'updateState', payload: payload}, '*');
    } else {
      pendingPayload = payload;
    }
  }

  // ---------- BIND TO FORM CHANGES ----------

  function bindFormListeners() {
    // Use event delegation on document body so we catch fields even after
    // Ecwid re-renders parts of the page.
    if (window.__ecwidPreviewBound) return;
    window.__ecwidPreviewBound = true;

    document.body.addEventListener('input',  scheduleUpdate, true);
    document.body.addEventListener('change', scheduleUpdate, true);
  }

  // Debounce: avoid spamming the iframe on every keystroke
  var updateTimer = null;
  function scheduleUpdate() {
    if (updateTimer) clearTimeout(updateTimer);
    updateTimer = setTimeout(sendUpdate, 150);
  }

  // ---------- INSERT THE IFRAME ----------

  function insertPreviewIframe() {
    // If already inserted, just bail
    if (document.getElementById('ecwidPreviewIframe')) return true;

    // Try to find the product image container
    var imgContainer =
      document.querySelector('.product-details__product-image-container') ||
      document.querySelector('.product-details__product-images') ||
      document.querySelector('[class*="product-image"]') ||
      document.querySelector('[class*="product-photo"]');

    if (!imgContainer) return false;

    // Build the iframe
    iframe = document.createElement('iframe');
    iframe.id = 'ecwidPreviewIframe';
    iframe.src = PREVIEW_IFRAME_URL;
    iframe.style.width = '100%';
    iframe.style.maxWidth = '500px';
    iframe.style.height = '520px';
    iframe.style.border = '1px solid #ddd';
    iframe.style.borderRadius = '8px';
    iframe.style.display = 'block';
    iframe.style.background = '#fff';
    iframe.allow = '';
    iframe.title = 'Live Jacket Preview';

    // Add a small label above
    var label = document.createElement('div');
    label.style.cssText =
      'font-size:12px;font-weight:700;color:#555;text-transform:uppercase;' +
      'letter-spacing:0.5px;padding:6px 0;text-align:center;';
    label.textContent = '— Live Preview —';

    // Hide the static image and insert our preview in its place
    var firstChild = imgContainer.firstElementChild;
    if (firstChild) firstChild.style.display = 'none';
    imgContainer.insertBefore(iframe, imgContainer.firstChild);
    imgContainer.insertBefore(label, iframe);

    return true;
  }

  // ---------- LISTEN FOR IFRAME READY ----------

  window.addEventListener('message', function (event) {
    var msg = event.data;
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'previewReady') {
      iframeReady = true;
      // Flush any payload that arrived before the iframe was ready
      if (pendingPayload) {
        iframe.contentWindow.postMessage(
          {type: 'updateState', payload: pendingPayload}, '*'
        );
        pendingPayload = null;
      } else {
        // Send the current state right away
        sendUpdate();
      }
    }
  });

  // ---------- ECWID NAVIGATION ----------

  // Ecwid uses client-side routing. The product page may not exist on first
  // pageload — it shows up after navigation. Watch the DOM for it.
  function initWhenReady() {
    if (!isTargetProductPage()) return;
    if (insertPreviewIframe()) {
      bindFormListeners();
      sendUpdate();
    }
  }

  // Watch for DOM changes (Ecwid swaps page content without full reload)
  observer = new MutationObserver(function () {
    initWhenReady();
  });
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });

  // Also try once after initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady);
  } else {
    initWhenReady();
  }
})();
