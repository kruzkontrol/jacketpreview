/* ============================================================
   KANEWORK / GREEK KUSTOMS
   ECWID LIVE JACKET PREVIEW BRIDGE

   This script:
   1. Detects an Ecwid PRODUCT page.
   2. Creates the Live Design Preview automatically.
   3. Loads https://tail261222.ts.net/
   4. Reads the customer's Ecwid product options.
   5. Sends those selections to the Python jacket preview.
   6. Keeps working when Ecwid rebuilds the page dynamically.
   ============================================================ */

(function () {
    "use strict";

    var KWP_DEBUG = false;

    /* =========================================================
       PREVIEW SERVER
       ========================================================= */

    var PREVIEW_HOST = "tail261222.ts.net";
    var PREVIEW_URL = "https://" + PREVIEW_HOST + "/";

    var PREVIEW_BOX_ID = "kanework-preview-box";
    var PREVIEW_FRAME_ID = "kanework-preview-frame";


    /* =========================================================
       ECWID OPTION LABEL -> PREVIEW FIELD
       ========================================================= */

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


    /* =========================================================
       ORGANIZATION COLORS
       ========================================================= */

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


    /* =========================================================
       ORGANIZATION NORMALIZATION
       ========================================================= */

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


    /* =========================================================
       COLOR SETTINGS
       ========================================================= */

    var COLOUR_FIELDS = {
        jacket: 1,
        letter: 1,
        outline: 1,
        number_color: 1,
        number_outline: 1
    };


    var AUTO_FIELDS = {
        letter: 1,
        outline: 1,
        number_color: 1,
        number_outline: 1
    };


    var OUTLINE_FIELDS = {
        outline: 1,
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


    /* =========================================================
       GARMENT BASE COLOR
       ========================================================= */

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


        /* Satin jackets are BODY/TRIM */

        if (text.indexOf("/") !== -1) {

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


    /* =========================================================
       TEXT NORMALIZATION
       ========================================================= */

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


    /* =========================================================
       GET TEXT WITHOUT INPUTS
       ========================================================= */

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


    /* =========================================================
       FIND OPTION LABEL
       ========================================================= */

    function labelFor(el) {

        var out = [];


        /* label[for=id] */

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


        /* Wrapped label */

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


        /* Walk upward through Ecwid wrappers */

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


    /* =========================================================
       MATCH OPTION LABEL
       ========================================================= */

    function matchLabel(label) {

        if (!label) {
            return null;
        }


        if (FIELDS[label]) {

            return FIELDS[label];
        }


        /*
         Use the longest matching known label.

         This prevents:

         LINE NUMBER COLOR

         from accidentally matching:

         LINE NUMBER
        */

        if (label.length <= 100) {

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


        /* aria-label first */

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


    /* =========================================================
       READ CURRENT CONTROL VALUE
       ========================================================= */

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


    /* =========================================================
       COLLECT ALL PRODUCT OPTIONS
       ========================================================= */

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


            /* COLORS */

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


            /* ORGANIZATION */

            else if (
                field === "front_org"
            ) {

                values[field] =
                    orgCode(raw);
            }


            /* YES / NO */

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


            /* TEXT */

            else {

                values[field] =
                    String(raw)
                    .trim();
            }


            if (KWP_DEBUG) {

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


    /* =========================================================
       FIND SELECTS FOR A PREVIEW FIELD
       ========================================================= */

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


    /* =========================================================
       CHANGE ECWID SELECT
       ========================================================= */

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


        return false;
    }


    /* =========================================================
       AUTOMATIC ORGANIZATION COLORS
       ========================================================= */

    var lastJacket = null;
    var lastOrg = null;

    var seeded = false;
    var applying = false;


    function autoFill() {

        if (applying) {
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


        /*
         First run only records what is already selected.
        */

        if (!seeded) {

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

        } finally {

            applying = false;
        }
    }


    /* =========================================================
       FIND EXISTING PREVIEW IFRAME
       ========================================================= */

    function frame() {

        var byId =
            document.getElementById(
                PREVIEW_FRAME_ID
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


    /* =========================================================
       DETECT ECWID PRODUCT PAGE

       IMPORTANT:
       The old version required a recognized Kanework option
       BEFORE it created the preview.

       That could cause:
           matched.length === 0
           -> no iframe
           -> completely blank product page

       This version does NOT require an option match first.
       ========================================================= */

    function isProductPage() {

        /*
         Ecwid product page containers.
        */

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


        /*
         Fallback:
         Your customizable products have recognizable fields.
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


    /* =========================================================
       FIND WHERE PREVIEW SHOULD BE INSERTED
       ========================================================= */

    function findPreviewMount() {

        /*
         FIRST CHOICE:
         Product option area.

         This puts the preview with the customization controls.
        */

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


        /*
         SECOND CHOICE:
         Product sidebar.
        */

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
         THIRD CHOICE:
         Find the last product option we recognize and
         put the preview directly after it.
        */

        var controls =
            document.querySelectorAll(
                "input," +
                "select," +
                "textarea"
            );


        var last = null;


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
         FOURTH CHOICE:
         Product page itself.
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


    /* =========================================================
       CREATE LIVE PREVIEW
       ========================================================= */

    function ensureFrame() {

        var existing =
            frame();


        if (existing) {

            return existing;
        }


        /*
         Do NOT create preview on catalog/cart/checkout pages.
        */

        if (!isProductPage()) {

            return null;
        }


        var existingBox =
            document.getElementById(
                PREVIEW_BOX_ID
            );


        if (existingBox) {

            var existingFrame =
                existingBox.querySelector(
                    "iframe"
                );


            if (existingFrame) {

                return existingFrame;
            }


            /*
             Broken leftover box.
             Remove it and rebuild.
            */

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


        if (!destination) {

            if (KWP_DEBUG) {

                console.log(
                    "[Kanework] " +
                    "Product page found, " +
                    "but preview mount " +
                    "not ready yet."
                );
            }


            return null;
        }


        /* ---------------------------------------------
           OUTER PREVIEW BOX
           --------------------------------------------- */

        var box =
            document.createElement(
                "div"
            );


        box.id =
            PREVIEW_BOX_ID;


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


        /* ---------------------------------------------
           HEADING
           --------------------------------------------- */

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


        /* ---------------------------------------------
           LOADING MESSAGE
           --------------------------------------------- */

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


        /* ---------------------------------------------
           IFRAME
           --------------------------------------------- */

        var iframe =
            document.createElement(
                "iframe"
            );


        iframe.id =
            PREVIEW_FRAME_ID;


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


        iframe.setAttribute(
            "allow",
            "clipboard-read; clipboard-write"
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


                /*
                 Send current selections again after iframe loads.
                */

                setTimeout(
                    send,
                    100
                );
            }
        );


        box.appendChild(
            iframe
        );


        /* ---------------------------------------------
           INSERT INTO ECWID PAGE
           --------------------------------------------- */

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


        if (KWP_DEBUG) {

            console.log(
                "[Kanework] " +
                "Live Jacket Preview inserted."
            );
        }


        return iframe;
    }


    /* =========================================================
       SEND OPTIONS TO PYTHON PREVIEW
       ========================================================= */

    function send() {

        try {

            autoFill();

        } catch (e) {

            if (KWP_DEBUG) {

                console.log(
                    "[Kanework] " +
                    "Auto color fill failed:",
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


        if (KWP_DEBUG) {

            console.log(
                "[Kanework] " +
                "Sending preview values:",
                values
            );
        }


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

            if (KWP_DEBUG) {

                console.log(
                    "[Kanework] " +
                    "Preview send failed:",
                    e
                );
            }
        }
    }


    /* =========================================================
       DEBOUNCE
       ========================================================= */

    var timer = null;


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


    /* =========================================================
       CUSTOMER CHANGES PRODUCT OPTION
       ========================================================= */

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


    /* =========================================================
       PYTHON PREVIEW SAYS IT IS READY
       ========================================================= */

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


    /* =========================================================
       ECWID PAGE LOADED
       ========================================================= */

    function startPreview() {

        /*
         Multiple attempts are intentional.

         Ecwid can render the product shell first and
         inject the options later.
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


    /* =========================================================
       ECWID SINGLE-PAGE APP WATCHER
       ========================================================= */

    var domTimer = null;


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

        if (KWP_DEBUG) {

            console.log(
                "[Kanework] " +
                "MutationObserver failed:",
                e
            );
        }
    }


    /* =========================================================
       EXTRA STARTUP FALLBACK
       ========================================================= */

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
