<?php
function sproduct_create_db_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    $subscriptions_table = "
        CREATE TABLE {$wpdb->prefix}s_subscriptions (
            id BIGINT(20) NOT NULL AUTO_INCREMENT,
            sproduct_id BIGINT(20) NOT NULL,
            user_id BIGINT(20) NOT NULL,
            end_date DATE NOT NULL,
            plan TEXT NOT NULL,
            PRIMARY KEY (id)
        ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($subscriptions_table);
}
