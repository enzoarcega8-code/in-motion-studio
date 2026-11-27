/* ==========================================================
   CONFIG  -  edit prices, classes and database keys here
   ========================================================== */

/** @type {any} */ (window).APP_CONFIG = {

    // Supabase (leave as-is to save bookings in the browser only)
    supabaseUrl: "https://YOUR_PROJECT_ID.supabase.co",
    supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",

    // Price per slot (in pesos)
    unitPrice: 800,

    // Classes shown in the booking portal
    classCatalog: {
        dancehall: {
            key: "dancehall",
            title: "DANCEHALL",
            styleLabel: "CLASS TYPE: DANCEHALL",
            priceText: "₱800.00",
            poster: "images/Kirsten.png",
            schedules: [
                "Saturday • 5:00 PM – 6:30 PM (Studio A)",
                "Saturday • 7:00 PM – 8:30 PM (Studio A)"
            ],
            description: "High-energy Dancehall class focusing on bounce, footwork foundations, rhythm, and full choreography at IN MOTION STUDIO."
        },
        openstyle: {
            key: "openstyle",
            title: "OPENSTYLE",
            styleLabel: "CLASS TYPE: OPENSTYLE",
            priceText: "₱800.00",
            poster: "images/Eldon.png",
            schedules: [
                "Sunday • 4:00 PM – 5:30 PM (Studio A)",
                "Sunday • 6:00 PM – 7:30 PM (Studio A)"
            ],
            description: "Versatile Openstyle session blending street styles, dynamic transitions, musicality, and personal movement expression."
        },
        gangsta: {
            key: "gangsta",
            title: "GANGSTA",
            styleLabel: "CLASS TYPE: GANGSTA",
            priceText: "₱800.00",
            poster: "images/Isla.png",
            schedules: [
                "Wednesday • 6:30 PM – 8:00 PM (Studio A)",
                "Friday • 7:00 PM – 8:30 PM (Studio A)"
            ],
            description: "Heavy-hitting Gangsta choreography session emphasizing power, groove, sharp textures, and confident stage presence."
        }
    }
};
