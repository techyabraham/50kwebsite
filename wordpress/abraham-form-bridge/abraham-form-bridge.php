<?php
/**
 * Plugin Name: Abraham Form Bridge
 * Description: Custom REST endpoint to bridge React form submissions to Fluent Forms.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    register_rest_route('abraham/v1', '/submit', [
        'methods'             => ['POST', 'OPTIONS'],
        'callback'            => 'abraham_handle_form_submission',
        'permission_callback' => '__return_true',
    ]);
});

function abraham_handle_form_submission(WP_REST_Request $request) {
    $allowed_origins = [
        'https://50kwebsite.vercel.app',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowed_origins, true)) {
        header("Access-Control-Allow-Origin: $origin");
    }

    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
    header('Access-Control-Allow-Credentials: true');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        return new WP_REST_Response(null, 200);
    }

    $body = $request->get_json_params();
    if (empty($body)) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'No data received.',
        ], 400);
    }

    $required = ['first_name', 'last_name', 'email', 'whatsapp', 'business_name'];
    foreach ($required as $field) {
        if (empty($body[$field])) {
            return new WP_REST_Response([
                'success' => false,
                'message' => "Missing required field: $field",
            ], 422);
        }
    }

    $first_name    = sanitize_text_field($body['first_name']);
    $last_name     = sanitize_text_field($body['last_name']);
    $email         = sanitize_email($body['email']);
    $whatsapp      = sanitize_text_field($body['whatsapp']);
    $business_name = sanitize_text_field($body['business_name']);
    $business_desc = sanitize_textarea_field($body['business_description'] ?? '');
    $city          = sanitize_text_field($body['city'] ?? '');
    $has_website   = sanitize_text_field($body['has_website'] ?? '');

    if (!is_email($email)) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Invalid email address.',
        ], 422);
    }

    $form_id = 10;

    if (!function_exists('wpFluent') || !class_exists('\FluentForm\App\Modules\Form\FormHandler')) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Fluent Forms not available on this server.',
        ], 500);
    }

    $form_data = [
        'names' => [
            'first_name' => $first_name,
            'last_name'  => $last_name,
        ],
        'email'                => $email,
        'phone'                => $whatsapp,
        'business_name'        => $business_name,
        'business_description' => $business_desc,
        'city'                 => $city,
        'has_website'          => $has_website,
    ];

    try {
        $form     = wpFluent()->table('fluentform_forms')->find($form_id);
        $handler  = new \FluentForm\App\Modules\Form\FormHandler($form_id);
        $response = $handler->submission($form_data, $form);

        return new WP_REST_Response([
            'success' => true,
            'message' => 'Your slot has been reserved! Abraham will be in touch shortly.',
            'data'    => $response,
        ], 200);
    } catch (\Exception $e) {
        global $wpdb;

        $entry_data = wp_json_encode([
            'first_name'           => $first_name,
            'last_name'            => $last_name,
            'email'                => $email,
            'whatsapp'             => $whatsapp,
            'business_name'        => $business_name,
            'business_description' => $business_desc,
            'city'                 => $city,
            'has_website'          => $has_website,
            'source'               => 'react-landing-page',
            'submitted_at'         => current_time('mysql'),
        ]);

        $wpdb->insert(
            $wpdb->prefix . 'fluentform_submissions',
            [
                'form_id'      => $form_id,
                'response'     => $entry_data,
                'source_url'   => 'https://50kwebsite.vercel.app',
                'created_at'   => current_time('mysql'),
                'updated_at'   => current_time('mysql'),
                'status'       => 'unread',
                'is_favourite' => 0,
            ],
            ['%d', '%s', '%s', '%s', '%s', '%s', '%d']
        );

        if ($wpdb->last_error) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Submission failed. Please contact Abraham directly on WhatsApp.',
                'debug'   => WP_DEBUG ? $e->getMessage() : null,
            ], 500);
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => 'Your slot has been reserved!',
        ], 200);
    }
}
