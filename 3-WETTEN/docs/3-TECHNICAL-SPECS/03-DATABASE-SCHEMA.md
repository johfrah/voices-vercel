# 🗄️ THE MASTER ENCYCLOPEDIA: VOICES DATABASE SCHEMA & MAPPING (2026)

Dit document is de absolute "Source of Truth" voor de data-architectuur van Voices.be. Het bevat ELKE tabel, meta-key, optie en formulier-mapping die het platform aandrijft, gebaseerd op een nucleaire scan van de productie-database en de codebase.

---

## 🏗️ 1. DATABASE ARCHITECTUUR (191 TABELLEN)

De database is opgebouwd uit verschillende "families" van tabellen.

### 🎙️ Voices Core & IAP (`wp_voices_*` - 57 tabellen)
Dit is de intelligentielaag van het platform.

| Tabelnaam | Doel | Velden (Selectie) |
| :--- | :--- | :--- |
| `wp_voices_actors` | Centraal stemacteurs beheer. | `id`, `first_name`, `last_name`, `email`, `phone`, `gender`, `native_lang`, `country`, `delivery_time`, `extra_langs`, `bio`, `why_voices`, `tagline`, `ai_tags`, `photo_id`, `logo_id`, `voice_score`, `price_unpaid`, `price_online`, `price_ivr`, `price_live_regie`, `dropbox_url`, `videoask`, `aftermovie_videoask`, `videostill_id`, `status`. |
| `wp_voices_actor_demos` | Audio demo's per stemacteur. | `id`, `actor_id`, `name`, `url`, `type`, `menu_order`. |
| `wp_voices_chat_conversations` | Beheer van chat-sessies. | `id`, `user_id`, `guest_name`, `guest_email`, `guest_phone`, `guest_age`, `guest_profession`, `ip_address`, `location_country`, `location_city`, `user_agent`, `guest_accepted`, `resolved`, `ttfi`, `open_count`, `self_evaluation`, `effectiveness_score`, `admin_id`, `status`, `order_id`, `product_id`, `context_page`, `language`. |
| `wp_voices_chat_messages` | Alle chat-berichten. | `id`, `conversation_id`, `sender_id`, `sender_type` ('user', 'admin', 'ai'), `message`, `attachments`, `read_at`, `is_ai_recommendation`, `is_test`. |
| `wp_voices_chat_faq` | AI-gevoede FAQ database. | `id`, `category`, `question_nl/fr/en/de`, `answer_nl/fr/en/de`, `translation_status`, `translation_source`, `translated_at`, `word_count_nl/fr/en/de`, `keyword_density`, `source_attribution`, `persona`, `journey_phase`, `subtheme`, `labels`, `call_to_action`, `internal_links`, `tags`, `contexts`, `product_categories`, `voicepage_personas`, `user_type`, `views`, `click_count`, `helpful_count`, `display_order`, `active`. |
| `wp_voices_course_progress` | Voortgang per student. | `id`, `user_id`, `course_id`, `lesson_id`, `status`, `video_timestamp`, `completed_at`. |
| `wp_voices_course_submissions` | Audio-inzendingen. | `id`, `user_id`, `lesson_id`, `file_path`, `status`, `feedback_text`, `feedback_audio_path`, `score_pronunciation/intonation/credibility`, `submitted_at`, `reviewed_at`. |
| `wp_voices_workshop_interest` | Leads van [studio_deelnemer_form]. | `id`, `voornaam`, `familienaam`, `email`, `status`, `product_ids`, `gf_entry_id`, `telefoon`, `leeftijd`, `beroep`, `ervaring`, `doel`, `voorbeeld`, `voorkeursdata`, `hoe_gehoord`, `source_url`, `ip_address`, `opt_out`, `smart_mail_sent_at`. |
| `wp_voices_visitors` | IAP Visitor tracking. | `id`, `visitor_hash`, `ip_hash`, `user_id`, `is_logged_in`, `session_id`, `user_agent`, `current_page`, `referrer`, `utm_source/medium/campaign`, `localstorage_data`, `session_data`, `visit_duration`, `page_views`, `first_visit_at`, `last_visit_at`, `is_bot`, `location_isp`, `company_org`, `is_business`, `ip_address`, `location_country/city/region/timezone`, `company_name`. |
| `wp_voices_utm_visitors` | Marketing attributie. | `id`, `visitor_hash`, `user_id`, `is_logged_in`, `session_id`, `visit_date`, `visit_timestamp`, `page_url`, `referrer`, `search_keywords`, `utm_source/medium/campaign/term/content`, `detected_source/medium`, `tracking_type`, `ab_test_name/variant`, `user_agent`, `device_type`, `browser_language`, `ip_hash`. |
| `wp_voices_email_clicks` | E-mail performance. | `id`, `token`, `email`, `recipient_name`, `email_type`, `email_status`, `order_id`, `user_id`, `original_url`, `utm_source/medium/campaign/term/content`, `language`, `sent_at`, `clicked_at`, `click_count`, `ip_address`, `user_agent`, `session_id`. |
| `wp_voices_studio_events` | Interactie-logs. | `id`, `visitor_id`, `session_id`, `user_id`, `event_type`, `event_data`, `page_url`, `referrer`, `utm_source/medium/campaign/term/content`, `video_id`, `workshop_id`, `form_type`, `conversion_id`, `timestamp`, `duration`. |
| `wp_voices_translations` | Voiceglot vertalingen. | `id`, `content_hash`, `source_lang`, `target_lang`, `original_text`, `source_text`, `translated_text`, `translation_hash`, `meta_json`, `engine`, `status`, `warnings`, `is_manual_edit`, `translation_method`, `quality_score`, `usage_count`, `translation_key`, `lang`, `type`, `context`, `last_edited_by`. |
| `wp_voices_yuki_outstanding` | Yuki Mirror: Openstaand. | `id`, `contact_id`, `contact_name`, `invoice_id`, `invoice_nr`, `invoice_date`, `due_date`, `amount`, `open_amount`, `currency`, `reference`, `last_synced`. |

---

## 🏷️ 2. META FIELDS ENCYCLOPEDIA (EXHAUSTIVE LIST)

Dit zijn de meta-keys die we in de code gebruiken, geverifieerd tegen de productie-database.

### 🎙️ Voice-over Producten (Post Meta - 2730 unieke keys)
- **Basis**: `voornaam`, `achternaam`, `gender`, `about-me`, `about-the-voice-language`, `client-list`, `voice-score`, `studio-info`, `telefoon`.
- **Audio (Demobeheer)**: De "Source of Truth" is de tabel `wp_voices_demos`.
    - **Fallback Meta**: `voice-over-demos` (array), `demo-telefonie`, `demo-corporate`, `demo-commercial`, `demo`.
    - **Samples (Legacy)**: `vrolijksample`, `warmsample`, `wervendsample`, `dromerigsample`, `modernsample`, `opgewektsample`, `relaxsample`.
- **Status**: `_voice_slug`, `_voice_approval_status`, `_voice_actor_user_id`, `_voice_signup_date`, `_voice_pending_changes`, `_voice_approval_date`, `_voice_approved_by`.
- **AI**: `voices_is_ai`, `elevenlabs_voice_id`.
- **Vakantie**: `holiday-from`, `holiday-till`, `holiday-email`, `holiday-name`, `afwezig-van`, `afwezig-tot`, `normale-beschikbaarheid`.
- **Prijzen (Excl. BTW)**:
    - **Basis**: `price_unpaid_media`, `price_ivr`, `price_live_regie`.
    - **Markt-specifiek** (BE, NL, FR, DE, UK, US): `{market}_price_online_media`, `{market}_price_podcast_preroll`, `{market}_price_radio_local/regional/national`, `{market}_price_tv_local/regional/national`, `{market}_price_live_regie`.
    - **Legacy Fallback**: `price_online_media`, `price_radio_local/regional/national`, `price_tv_local/regional/national`, `price_podcast_preroll`.
- **Assets**: `_pricing_last_updated`, `_uploaded_demos`, `_dropbox_folder_path`, `_dropbox_folder_url`, `_voice_vat_number`, `_voice_yuki_contact_id`, `_wp_attached_file`, `_wp_attachment_metadata`, `_thumbnail_id`.
- **SEO (Voices)**: `_voices_search_excluded`, `_voices_seo_title`, `_voices_seo_description`, `_voices_seo_noindex`, `_voices_seo_og_image`, `_voices_seo_updated`, `_voices_seo_keyword`.
- **SEO (Rank Math)**: `rank_math_seo_score`, `rank_math_robots`, `rank_math_description`, `rank_math_title`, `rank_math_focus_keyword`.
- **Meertaligheid**: `_post_title_de/en/fr`, `_post_content_de/en/fr`, `_post_excerpt_de/en/fr`, `weglot_language`.
- **Demos (Legacy/Specific)**: `phone-demos`, `voice-over-demos`, `commercial`, `corporate`, `audiobriefing`, `howto`, `voice-header`, `voice-mobile`.
- **Interne API**: `api_pv_job_status`, `api_pv_json`, `api_pv_last_updated`, `api_pv_search_query`, `api_pv_video_urls`.

### 🛒 Orders & Commerce (Order Meta - 4591 unieke keys)
- **Identificatie**: `be_order_number`, `_order_number`, `_order_key`, `_created_via`, `_cart_hash`, `_customer_user`.
- **BTW & VIES**: `_billing_vat_number`, `is_vat_exempt`, `_vies_address_match`, `_vies_last_updated`, `ywev_CITY`, `ywev_COUNTRY`, `ywev_IP_ADDRESS`, `ywev_POST_CODE`, `ywev_STATE`, `ywev_vat_exemption_amount`, `btw_number`, `btw_nummer`.
- **IAP Context**: `_order_journey`, `_order_language`, `_order_lang`, `_journey`, `_iap_context`, `_journey_context`, `_customer_context_analyzed`, `_customer_context_analyzed_at`.
- **Yuki & Peppol**: `_yuki_invoice_id`, `_yuki_pushed`, `_yuki_processed`, `_yuki_response_message`, `_peppol_status`, `_billing_peppol_endpoint`.
- **Invoicing (YITH/PDF)**: `_ywpi_invoice_number`, `_ywpi_invoice_date`, `_ywpi_invoice_formatted_number`, `_ywpi_invoice_path`, `_ywpi_invoice_prefix`, `_ywpi_invoice_suffix`, `_ywpi_has_pro_forma`, `_wcpdf_invoice_settings`.
- **Financieel & COG (Algoritmia)**: `_order_total`, `_order_tax`, `_order_shipping`, `_cart_discount`, `_alg_wc_cog_order_cost`, `_alg_wc_cog_order_price`, `_alg_wc_cog_order_profit`, `_alg_wc_cog_order_profit_margin`, `_alg_wc_cog_order_profit_percent`, `_alg_wc_cog_order_fees`, `_alg_wc_cog_order_gateway_cost`, `_alg_wc_cog_order_handling_fee`, `_alg_wc_cog_order_shipping_cost`.
- **Betaling**: `_payment_method`, `_payment_method_title`, `_transaction_id`, `_date_paid`, `_date_completed`, `_mollie_payment_id`, `_mollie_order_id`, `_mollie_paid_and_processed`.
- **Marketing (Metorik)**: `_metorik_session_count`, `_metorik_session_pages`, `_metorik_source_type`, `_metorik_utm_source`, `_metorik_utm_medium`, `_metorik_referer`, `_metorik_cart_token`.
- **Marketing (AFL WC UTM)**: `_utm_attribution_model`, `_utm_tracking_type`, `_utm_page_url`, `_utm_referrer`, `_utm_touchpoint_timestamp`, `_utm_time_to_conversion`, `_utm_source_type`, `_utm_first_campaign/medium/source`.
- **Quote (YITH)**: `ywraq_raq`, `ywraq_customer_message`, `ywraq_customer_email`, `ywraq_customer_name`, `ywraq_status`, `_ywraq_pay_quote_now`, `_ywraq_lock_editing`.
- **Legacy & Form**: `_gravity_form_lead`, `_gravity_form_data`, `gf_entry_id`, `billing_po`, `additional_reference`.

### 📦 Order Items (Item Meta - 398 unieke keys)
- **Workshop**: `Voornaam`, `Familienaam`, `Email`, `Datum`, `Tijd`, `Uur`, `Locatie`, `Aantal woorden`, `Beroep`, `Leeftijd`.
- **Stem**: `Stemnaam`, `Taal`, `Gebruik`, `Tekst`, `Instructies`, `Medium`, `Voice-over type`, `Stem`, `_Voice`, `pa_stem`.
- **Financieel & COG**: `_alg_wc_cog_item_cost`, `_alg_wc_cog_item_profit`, `_yith_cog_item_cost`, `_COG`, `_Commissie`, `_Basiskost`, `Totaal`, `_line_total`, `_line_tax`, `_line_subtotal`.
- **Product Info**: `_product_id`, `_variation_id`, `_qty`, `_ywpi_product_sku`, `_ywpi_product_regular_price`.
- **Metadata**: `voices_metadata`, `voices_countries`, `voices_gebruik`, `voices_media`, `voices_tekst`, `voices_spots`, `voices_jaren`.
- **Montage & Muziek**: `Montage`, `Muziek`, `Editing`, `MontageBasis`, `Montage percentage`.
- **Telefonie**: `Telefonie`, `Wachtboodschap`, `Eigen voicemail bericht`.
- **Legacy/Other**: `_gravity_forms_history`, `_weglot_lang`, `_Discount`.

### 👤 Gebruikers (User Meta - 620 unieke keys)
- **Basis**: `first_name`, `last_name`, `nickname`, `description`, `billing_email`, `billing_phone`.
- **Preferences**: `voices_preferences` (Master JSON), `preferred_language`, `preferred_market`, `voices_preference_preferred_language`, `voices_preference_preferred_gebruik`, `voices_preference_cookie_consent`.
- **Tracking**: `voices_play_history`, `voices_download_history`, `voices_checkout_history`, `voices_video_history`, `voices_external_link_history`, `voices_add_to_cart_history`, `voices_activity_log`.
- **Academy**: `voices_academy_access`, `voices_academy_dropbox_path`, `_voices_subroles`, `voices_preference_version`.
- **Marketing (Metorik)**: `_metorik_session_count`, `_metorik_source_type`, `_metorik_utm_source`, `_metorik_utm_medium`, `_metorik_referer`.
- **Marketing (AFL WC UTM)**: `wp_afl_wc_utm_active_conversions`, `wp_afl_wc_utm_last_lead_date_local`, `wp_afl_wc_utm_active_has_lead`, `wp_afl_wc_utm_conversion_type`, `wp_afl_wc_utm_cookie_consent`.
- **CLV & Insights**: `paying_customer`, `_money_spent`, `_order_count`, `_customer_insights`, `aantal_orders`, `totale_waarde`, `laatste_bestel_datum`.
- **Adres & BTW**: `billing_address_1`, `billing_city`, `billing_postcode`, `billing_country`, `billing_company`, `billing_vat_number`, `yweu_vat_number`, `btw_number`.
- **Social**: `facebook`, `twitter`, `googleplus`.
- **Voices Internal**: `voices_customer_notifications`, `voices_faq_visited_pages`, `voices_last_captured_email`, `voices_abandoned_carts`.

---

## 📝 3. FORMULIER MAPPING (GRAVITY FORMS ROSETTA STONE)

Mapping van de "magische nummers" uit `GFAPI::get_entry` en `rgar()`.

| Field ID | Data Punt | Gebruik in Code |
| :--- | :--- | :--- |
| `1` | Voornaam | `rgar($entry, '1')` |
| `1.3` / `1.6` | Naam velden | `rgar($entry, '1.3')` |
| `2` | E-mail | `rgar($entry, '2')` |
| `3` | Geslacht | `rgar($entry, '3')` |
| `4` | Taal | `rgar($entry, '4')` |
| `5` | Accent / Volledige Naam | `rgar($entry, '5')` |
| `7` | Demo URL | `rgar($entry, '7')` |
| `8` | Prijs / Land | `rgar($entry, '8')` |
| `9` | UTM Source / Telefoon | `rgar($entry, '9')` |
| `10` | UTM Medium | `rgar($entry, '10')` |
| `11` | UTM Term / Leeftijd | `rgar($entry, '11')` |
| `12` | UTM Content / Voornaam (Order) | `rgar($entry, '12')` |
| `13` | UTM Campaign / Familienaam (Order) | `rgar($entry, '13')` |
| `14` | First UTM Source / E-mail | `rgar($entry, '14')` |
| `15` | Beroep | `rgar($entry, '15')` |
| `16` | Delivery / First UTM Medium | `rgar($entry, '16')` |
| `17` | First UTM Term | `rgar($entry, '17')` |
| `24` | E-mail (Alternatief) | `rgar($entry, '24')` |
| `34` | Bedrijf | `rgar($entry, '34')` |
| `35` | BTW Nummer | `rgar($entry, '35')` |
| `1001` | Product ID | `rgar($entry, '1001')` |

---

## ⚙️ 4. GLOBAL OPTIONS (15.963 KEYS)

Dit zijn de centrale configuratie-instellingen in `wp_options`.

| Prefix | Omschrijving | Voorbeelden |
| :--- | :--- | :--- |
| `voices_` | **Core Config**: AI, Chat, SMTP, Cache, Opening Hours. | `voices_ai_provider`, `voices_chat_enabled`, `voices_smtp_host`, `voices_voiceglot_db_version`, `voices_monthly_revenue_goal`. |
| `_voices_` | **Voices Metadata**: AI kosten, hashes en SEO defaults. | `_voices_gemini_api_key`, `_voices_openai_model`, `_voices_seo_site_name`, `_voices_hash_posts_*`, `_voices_ai_daily_cost_*`. |
| `_voices_seo_` | **SEO AI Config**: Specifieke AI settings voor SEO. | `_voices_seo_ai_api_key`, `_voices_seo_ai_endpoint`, `_voices_seo_ai_model`, `_voices_seo_agency_site_name`. |
| `woocommerce_` | **Commerce**: Shop instellingen, Gateways, Tax rules. | `woocommerce_currency`, `woocommerce_cart_page_id`, `woocommerce_enable_reviews`, `woocommerce_tax_classes`. |
| `wc_` | **WC Addons**: Specifieke instellingen voor WC extensies. | `wc_checkout_add_ons`, `wc_cog_version`, `wc_facebook_pixel_id`, `wc_od_delivery_days`. |
| `yith_` | **YITH Plugins**: Instellingen voor YITH extensies. | `yith_wcwl_wishlist_page_id`, `yith_wcaf_general_rate`, `yith_wcas_min_chars`, `yith_wpv_vendor_label_singular_text`. |
| `ywpi_` | **YITH Invoices**: Facturatie instellingen. | `ywpi_company_name`, `ywpi_invoice_number_format`, `ywpi_create_invoice_on`. |
| `ywraq_` | **YITH Quotes**: Offerte instellingen. | `ywraq_page_id`, `ywraq_enable_order_creation`, `ywraq_pdf_attachment`. |
| `jet_` | **Engine**: Legacy JetEngine en JetPopup data. | `jet_engine_modules`, `jet_popup_conditions`, `jet_woo_builder`. |
| `rank_math_` | **SEO**: Rank Math configuratie. | `rank_math_modules`, `rank_math_google_analytic_profile`, `rank_math_sitemap_cache_files`. |
| `_elementor_` | **Page Builder**: Elementor instellingen en experimenten. | `_elementor_general_settings`, `_elementor_pro_license_data`. |
| `_transient_` | **Performance**: Tijdelijke cache van API's en queries. | `_transient_timeout_voices_*`, `_transient_wc_count_comments`. |
| `complianz_` | **GDPR**: Cookie consent instellingen. | `cmplz_options`, `cmplz_active_integrations`. |
| `handl_` | **Marketing**: HandL UTM Grabber instellingen. | `handl_fb_pixel_id`, `handl_integromat_url`. |
| `wp_` | **WordPress Core**: Basis WP instellingen. | `wp_user_roles`, `wp_mail_smtp`, `siteurl`, `home`. |

---

## 🔌 5. PLUGIN-SPECIFIC DATA (POST & TERM META)

Deze data wordt beheerd door externe plugins maar is cruciaal voor de site-werking.

### 📈 Rank Math (SEO)
- **Post Meta**: `rank_math_seo_score`, `rank_math_robots`, `rank_math_description`, `rank_math_title`, `rank_math_focus_keyword`, `rank_math_analytic_object_id`, `rank_math_internal_links_processed`.
- **Term Meta**: `rank_math_title`, `rank_math_description`, `rank_math_focus_keyword`, `rank_math_seo_score`.

### 🏗️ Elementor (Page Builder)
- **Post Meta**: `_elementor_data`, `_elementor_edit_mode`, `_elementor_template_type`, `_elementor_version`, `_elementor_page_settings`, `_elementor_controls_usage`.

### 🛡️ Complianz (GDPR)
- **Post Meta**: `_cmplz_scanned_post`, `cmplz_hide_cookiebanner`.

### 🚀 Crocoblock / Jet (Engine)
- **Post Meta**: `_jet_woo_product_video_type`, `jet_engine_store_count_recently-viewed`, `jet_engine_store_count_favorites`.
- **Term Meta**: `jet_woo_builder_template`.

### 📊 Metorik & Attribution
- **Order Meta**: `_metorik_session_count`, `_metorik_source_type`, `_metorik_utm_source`.
- **User Meta**: `_metorik_session_pages`, `_metorik_referer`.

### 📝 Gravity Forms (Entry Meta)
- **Keys**: `gppcmt_pretty_id`, `fg_easypassthrough_token`, `gpfr_stashed_file_urls`.
- **Field IDs**: Zie Rosetta Stone in `.cursor/rules/210-gravity-forms-mapping.mdc`.

---

## 🗺️ 6. MAPPING PROTOCOL (GOD MODE)

1.  **Data Unification**: We normaliseren alle bronnen (GF entries, Meta, Custom Tables) naar de `VoicesCockpit` data-structuur.
2.  **Meta Access**: Gebruik ALTIJD de wrappers uit de **Developer Toolbox** (bijv. `voices_get_preference()`).
3.  **Contextual IDs**: Map in de UI altijd naar de primaire ID (bijv. `data-voices-context="order-274347"`) voor Voicy-interactie.
4.  **Live Reality Check**: Bij twijfel over een key of waarde MOET de live database geraadpleegd worden. Documentatie en `.mdc` regels moeten direct worden bijgewerkt als de realiteit afwijkt.

---
**ULTIEME WET:** Dit document bevat de volledige anatomie van de Voices database. Elke transformatie naar God Mode MOET deze mapping respecteren om 100% data-integriteit te garanderen. Bij afwijkingen in de live database is de live data leidend en moet dit document direct worden gecorrigeerd.
