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

    register_rest_route('abraham/v1', '/intake', [
        'methods'             => ['POST', 'OPTIONS'],
        'callback'            => 'abraham_handle_intake_submission',
        'permission_callback' => '__return_true',
    ]);
});

function abraham_send_cors_headers() {
    $allowed_origins = [
        'https://50kwebsite.vercel.app',
        'https://www.50kwebsite.vercel.app',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowed_origins, true)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Vary: Origin');
    }

    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400');
}

function abraham_handle_form_submission(WP_REST_Request $request) {
    abraham_send_cors_headers();

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        return new WP_REST_Response(null, 200);
    }

    $body = $request->get_json_params();
    if (empty($body)) {
        $body = json_decode($request->get_body(), true);
    }

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

    if (!class_exists('\FluentForm\App\Services\Form\SubmissionHandlerService')) {
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
        $response = (new \FluentForm\App\Services\Form\SubmissionHandlerService())->handleSubmission($form_data, $form_id);

        return new WP_REST_Response([
            'success' => true,
            'message' => 'Your slot has been reserved! Abraham will be in touch shortly.',
            'data'    => $response,
        ], 200);
    } catch (\Throwable $e) {
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

function abraham_get_request_body(WP_REST_Request $request) {
    $body = $request->get_json_params();
    if (empty($body)) {
        $body = json_decode($request->get_body(), true);
    }

    return is_array($body) ? $body : [];
}

function abraham_handle_intake_submission(WP_REST_Request $request) {
    abraham_send_cors_headers();

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        return new WP_REST_Response(null, 200);
    }

    $body = abraham_get_request_body($request);

    if (empty($body)) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'No onboarding data received.',
        ], 400);
    }

    $required = ['name', 'businessName', 'whatsapp', 'email', 'whatYouDo', 'audience', 'goal', 'services', 'pages', 'tone'];
    foreach ($required as $field) {
        if (empty($body[$field])) {
            return new WP_REST_Response([
                'success' => false,
                'message' => "Missing required field: $field",
            ], 422);
        }
    }

    $email = sanitize_email($body['email']);
    if (!is_email($email)) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Invalid email address.',
        ], 422);
    }

    $form_id = 11;

    if (!class_exists('\FluentForm\App\Services\Form\SubmissionHandlerService')) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Fluent Forms not available on this server.',
        ], 500);
    }

    $form_data = [
        'name'              => sanitize_text_field($body['name']),
        'business_name'     => sanitize_text_field($body['businessName']),
        'whatsapp'          => sanitize_text_field($body['whatsapp']),
        'email'             => $email,
        'what_you_do'       => sanitize_textarea_field($body['whatYouDo']),
        'audience'          => sanitize_textarea_field($body['audience']),
        'goal'              => sanitize_text_field($body['goal']),
        'services'          => sanitize_textarea_field($body['services']),
        'pages'             => sanitize_text_field($body['pages']),
        'tone'              => sanitize_text_field($body['tone']),
        'colors'            => sanitize_text_field($body['colors'] ?? ''),
        'inspiration'       => esc_url_raw($body['inspiration'] ?? ''),
        'file_names'        => sanitize_text_field($body['files'] ?? ''),
        'instagram'         => sanitize_text_field($body['instagram'] ?? ''),
        'facebook'          => sanitize_text_field($body['facebook'] ?? ''),
        'tiktok'            => sanitize_text_field($body['tiktok'] ?? ''),
        'twitter'           => sanitize_text_field($body['twitter'] ?? ''),
        'extras'            => sanitize_textarea_field($body['extras'] ?? ''),
        'payment_method'    => sanitize_text_field($body['payment_method'] ?? ''),
        'payment_reference' => sanitize_text_field($body['payment_reference'] ?? ''),
        'paid_at'           => sanitize_text_field($body['paid_at'] ?? ''),
        'source'            => sanitize_text_field($body['source'] ?? 'react-onboarding-page'),
    ];

    try {
        $response = (new \FluentForm\App\Services\Form\SubmissionHandlerService())->handleSubmission($form_data, $form_id);

        return new WP_REST_Response([
            'success' => true,
            'message' => 'Your website brief has been submitted.',
            'data'    => $response,
        ], 200);
    } catch (\Throwable $e) {
        global $wpdb;

        $wpdb->insert(
            $wpdb->prefix . 'fluentform_submissions',
            [
                'form_id'      => $form_id,
                'response'     => wp_json_encode($form_data),
                'source_url'   => 'https://50kwebsite.vercel.app/onboarding',
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
                'message' => 'Onboarding submission failed. Please contact Abraham directly on WhatsApp.',
                'debug'   => WP_DEBUG ? $e->getMessage() : null,
            ], 500);
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => 'Your website brief has been submitted.',
        ], 200);
    }
}
