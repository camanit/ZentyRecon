<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * VerifyZentyReconApiKey
 * Validates X-ZentyRecon-Key header for incoming requests from extension
 */
class VerifyZentyReconApiKey
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-ZentyRecon-Key');

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'Missing X-ZentyRecon-Key header. Please provide your API key or license.',
            ], 401);
        }

        return $next($request);
    }
}
