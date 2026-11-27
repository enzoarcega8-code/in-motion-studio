/* jshint esversion: 11, browser: true */

/**
 * @typedef {Object} ClassInfo
 * @property {string} key
 * @property {string} title
 * @property {string} styleLabel
 * @property {string} priceText
 * @property {string} poster
 * @property {string[]} schedules
 * @property {string} description
 */

/**
 * @typedef {Object} BookingRecord
 * @property {string} full_name
 * @property {string} email
 * @property {string} contact_info
 * @property {string} class_type
 * @property {string} schedule_slot
 * @property {number} quantity
 * @property {string} preferred_date
 * @property {string} payment_method
 * @property {number} total_amount
 */

(function () {
    "use strict";

    // Settings come from js/config.js
    /** @type {{supabaseUrl: string, supabaseAnonKey: string, unitPrice: number, classCatalog: Object<string, ClassInfo>}} */
    const CONFIG = /** @type {any} */ (window).APP_CONFIG;
    const SUPABASE_URL = CONFIG.supabaseUrl;
    const SUPABASE_ANON_KEY = CONFIG.supabaseAnonKey;
    const UNIT_PRICE = CONFIG.unitPrice;
    const classCatalog = CONFIG.classCatalog;

    /* ==========================================================
       1. HELPERS
       ========================================================== */
    /**
     * @param {string} id
     * @returns {any}
     */
    function byId(id) {
        return document.getElementById(id);
    }

    /** @param {HTMLElement} el */
    function show(el) {
        el.classList.remove("hidden");
    }

    /** @param {HTMLElement} el */
    function hide(el) {
        el.classList.add("hidden");
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /**
     * @param {*} str
     * @returns {string}
     */
    function escapeHTML(str) {
        /** @type {Object<string, string>} */
        const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
        return String(str).replace(/[&<>"']/g, function (/** @type {string} */ c) {
            return map[c];
        });
    }

    /**
     * @param {number} amount
     * @returns {string}
     */
    function formatPeso(amount) {
        return "₱" + amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /** @returns {string} */
    function todayISO() {
        const d = new Date();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return d.getFullYear() + "-" + month + "-" + day;
    }

    /* ==========================================================
       2. ELEMENTS & STATE
       ========================================================== */
    const mainSiteContent = byId("mainSiteContent");
    const bookingPortal = byId("bookingPortal");
    const catalogView = byId("bookingCatalogView");
    const detailView = byId("bookingDetailView");
    const checkoutView = byId("bookingCheckoutView");

    let currentClass = classCatalog.dancehall;
    let currentQuantity = 1;

    /* ==========================================================
       3. BOOKING FLOW (catalog -> detail -> checkout)
       ========================================================== */
    /** @param {HTMLElement} view */
    function showView(view) {
        [catalogView, detailView, checkoutView].forEach(function (/** @type {HTMLElement} */ v) {
            if (v === view) {
                show(v);
            } else {
                hide(v);
            }
        });
        scrollToTop();
    }

    function openBookingCatalog() {
        hide(mainSiteContent);
        show(bookingPortal);
        showView(catalogView);
    }

    function closeBookingFlow() {
        hide(bookingPortal);
        show(mainSiteContent);
    }

    function updateQuantityUI() {
        byId("qtyValue").textContent = currentQuantity;
        byId("detailBtnTotal").textContent = formatPeso(currentQuantity * UNIT_PRICE);
    }

    /** @param {string} activeKey */
    function renderRelatedClasses(activeKey) {
        /** @type {ClassInfo[]} */
        const others = Object.values(classCatalog).filter(function (/** @type {ClassInfo} */ item) {
            return item.key !== activeKey;
        });

        byId("relatedClassesGrid").innerHTML = others.map(function (/** @type {ClassInfo} */ item) {
            return `
                <div class="catalog-item-card" data-action="open-class" data-class="${escapeHTML(item.key)}" role="button" tabindex="0">
                    <div class="catalog-item-img">
                        <img src="${escapeHTML(item.poster)}" alt="${escapeHTML(item.title)}">
                        <span class="card-corner-tag">${escapeHTML(item.title)}</span>
                    </div>
                    <div class="catalog-item-caption">
                        <h3>${escapeHTML(item.title)}</h3>
                        <span class="catalog-price">${escapeHTML(item.priceText)}</span>
                    </div>
                </div>`;
        }).join("");
    }

    /** @param {string} classKey */
    function openClassDetail(classKey) {
        currentClass = classCatalog[classKey] || classCatalog.dancehall;
        currentQuantity = 1;

        byId("detailPillTag").textContent = currentClass.title + " • " + currentClass.priceText;
        byId("detailStyleLabel").textContent = currentClass.styleLabel;
        byId("detailTitle").textContent = currentClass.title;
        byId("detailPrice").textContent = currentClass.priceText;
        byId("detailDescription").textContent = currentClass.description;
        byId("detailPoster").src = currentClass.poster;
        byId("detailPoster").alt = currentClass.title + " Poster";

        byId("detailScheduleSelect").innerHTML = currentClass.schedules.map(function (/** @type {string} */ slot) {
            return `<option value="${escapeHTML(slot)}">${escapeHTML(slot)}</option>`;
        }).join("");

        updateQuantityUI();
        renderRelatedClasses(currentClass.key);
        showView(detailView);
    }

    function openCheckoutForm() {
        const totalPeso = formatPeso(currentQuantity * UNIT_PRICE);

        byId("checkoutPoster").src = currentClass.poster;
        byId("checkoutClassName").textContent = currentClass.title;
        byId("checkoutTimeSlot").textContent = byId("detailScheduleSelect").value;
        byId("checkoutQtyBadge").textContent =
            currentQuantity + " " + (currentQuantity > 1 ? "SLOTS" : "SLOT") + " × " + formatPeso(UNIT_PRICE);
        byId("checkoutSlotCount").textContent = currentQuantity;
        byId("checkoutTotalAmount").textContent = totalPeso;
        byId("submitBtnPrice").textContent = totalPeso;

        // Past dates can't be booked
        byId("sessionDate").min = todayISO();

        show(byId("databaseBookingForm"));
        hide(byId("bookingConfirmation"));
        showView(checkoutView);
    }

    function backToDetailView() {
        showView(detailView);
    }

    /* ==========================================================
       4. CLICK HANDLING (buttons use data-action in the HTML)
       ========================================================== */
    /** @type {Object<string, function(HTMLElement): void>} */
    const actions = {
        "open-catalog": openBookingCatalog,
        "close-flow": closeBookingFlow,
        "open-checkout": openCheckoutForm,
        "back-detail": backToDetailView,
        "open-class": function (/** @type {HTMLElement} */ el) {
            openClassDetail(el.getAttribute("data-class"));
        }
    };

    document.addEventListener("click", function (e) {
        const el = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest("[data-action]"));
        if (!el) { return; }
        const run = actions[el.getAttribute("data-action")];
        if (run) { run(el); }
    });

    // Let Enter / Space activate the class cards (keyboard users)
    document.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") { return; }
        const el = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest("[role='button'][data-action]"));
        if (!el) { return; }
        e.preventDefault();
        el.click();
    });

    byId("qtyMinusBtn").addEventListener("click", function () {
        if (currentQuantity > 1) {
            currentQuantity--;
            updateQuantityUI();
        }
    });

    byId("qtyPlusBtn").addEventListener("click", function () {
        if (currentQuantity < 10) {
            currentQuantity++;
            updateQuantityUI();
        }
    });

    /* ==========================================================
       5. BOOKING SUBMISSION (Supabase + saved in this browser)
       ========================================================== */
    const bookingForm = byId("databaseBookingForm");
    const submitBtn = byId("submitBookingBtn");
    const SUBMIT_ICON = "<i class=\"fa-solid fa-calendar-check\"></i> ";

    /**
     * @param {BookingRecord} record
     * @returns {Promise<boolean>}
     */
    async function saveToSupabase(record) {
        if (SUPABASE_URL.indexOf("YOUR_PROJECT_ID") !== -1) { return false; }
        try {
            const res = await fetch(SUPABASE_URL + "/rest/v1/bookings", {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": "Bearer " + SUPABASE_ANON_KEY,
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                body: JSON.stringify(record)
            });
            return res.ok;
        } catch (error) {
            console.error("Database error:", error);
            return false;
        }
    }

    /** @param {BookingRecord} record */
    function saveToBrowser(record) {
        try {
            const existing = JSON.parse(localStorage.getItem("inMotionBookings") || "[]");
            existing.push(Object.assign({}, record, { created_at: new Date().toISOString() }));
            localStorage.setItem("inMotionBookings", JSON.stringify(existing));
        } catch (err) {
            console.error("Local save failed:", err);
        }
    }

    /** @param {BookingRecord} record */
    function showReceipt(record) {
        hide(bookingForm);
        show(byId("bookingConfirmation"));

        byId("confirmationText").textContent =
            "Thank you! Your booking has been recorded. Please keep this receipt for your reference.";

        byId("receiptDetails").innerHTML = `
            <p><strong>Name:</strong> ${escapeHTML(record.full_name)}</p>
            <p><strong>Email:</strong> ${escapeHTML(record.email)}</p>
            <p><strong>Contact / IG:</strong> ${escapeHTML(record.contact_info)}</p>
            <p><strong>Class:</strong> ${escapeHTML(record.class_type)} (${escapeHTML(record.schedule_slot)})</p>
            <p><strong>Slots &amp; Date:</strong> ${record.quantity} slot(s) on ${escapeHTML(record.preferred_date)}</p>
            <p><strong>Payment &amp; Total:</strong> ${escapeHTML(record.payment_method)} • ${formatPeso(record.total_amount)}</p>`;
    }

    bookingForm.addEventListener("submit", async function (/** @type {Event} */ e) {
        e.preventDefault();

        const total = currentQuantity * UNIT_PRICE;
        /** @type {BookingRecord} */
        const record = {
            full_name: byId("fullName").value.trim(),
            email: byId("emailAddress").value.trim(),
            contact_info: byId("contactInfo").value.trim(),
            class_type: currentClass.title,
            schedule_slot: byId("detailScheduleSelect").value,
            quantity: currentQuantity,
            preferred_date: byId("sessionDate").value,
            payment_method: byId("paymentMethod").value,
            total_amount: total
        };

        submitBtn.disabled = true;
        submitBtn.innerHTML = "<i class=\"fa-solid fa-spinner fa-spin\"></i> SAVING...";

        const savedCloud = await saveToSupabase(record);
        saveToBrowser(record);
        if (!savedCloud) {
            console.warn("Booking saved in this browser only. Add your Supabase URL and anon key in js/config.js for cloud sync.");
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = SUBMIT_ICON + "COMPLETE BOOKING (" + formatPeso(total) + ")";

        showReceipt(record);
        bookingForm.reset();
    });

    /* ==========================================================
       6. SCROLL FADE-IN ANIMATION
       ========================================================== */
    const appearOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) { return; }
            entry.target.classList.add("appear");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.2, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(".fade-in").forEach(function (el) {
        appearOnScroll.observe(el);
    });

    /* ==========================================================
       7. GALLERY CAROUSEL + DOTS
       ========================================================== */
    const track = byId("galleryTrack");
    const dotsBox = byId("galleryDots");
    const dots = document.querySelectorAll(".carousel-dots .dot");
    const cards = document.querySelectorAll(".program-card");

    function getScrollStep() {
        if (!cards.length) { return 1; }
        const gap = parseInt(getComputedStyle(track).gap, 10) || 18;
        return /** @type {HTMLElement} */ (cards[0]).offsetWidth + gap;
    }

    function updateDots() {
        const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
        const index = atEnd
            ? dots.length - 1
            : Math.min(dots.length - 1, Math.round(track.scrollLeft / getScrollStep()));
        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === index);
        });
    }

    // Hide the dots when every card already fits (desktop)
    function toggleDotsVisibility() {
        const canScroll = track.scrollWidth > track.clientWidth + 2;
        dotsBox.style.display = canScroll ? "flex" : "none";
        updateDots();
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            const index = parseInt(dot.getAttribute("data-index"), 10);
            const maxScroll = track.scrollWidth - track.clientWidth;
            track.scrollTo({ left: Math.min(index * getScrollStep(), maxScroll), behavior: "smooth" });
        });
    });

    track.addEventListener("scroll", updateDots);
    window.addEventListener("resize", toggleDotsVisibility);
    window.addEventListener("load", toggleDotsVisibility);
    toggleDotsVisibility();

    /* ==========================================================
       8. VIDEO PLAY / PAUSE
       ========================================================== */
    const studioVideo = byId("studioVideo");
    const videoToggleBtn = byId("videoToggleBtn");
    const videoIcon = videoToggleBtn.querySelector("i");

    function toggleVideo() {
        if (studioVideo.paused) {
            studioVideo.play().then(function () {
                videoToggleBtn.classList.add("playing");
                videoIcon.classList.replace("fa-play", "fa-pause");
            }).catch(function (/** @type {any} */ err) {
                console.error("Video could not play:", err);
            });
        } else {
            studioVideo.pause();
            videoToggleBtn.classList.remove("playing");
            videoIcon.classList.replace("fa-pause", "fa-play");
        }
    }

    videoToggleBtn.addEventListener("click", toggleVideo);
    studioVideo.addEventListener("click", toggleVideo);
})();
