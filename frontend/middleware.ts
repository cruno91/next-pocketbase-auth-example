import { NextRequest, NextResponse } from 'next/server';
import { isTokenExpired } from 'pocketbase';

export function middleware(request: NextRequest) {
	// Protected routes that require authentication
	const protectedRoutes = ['/dashboard', '/admin', '/user'];

	if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
		const authCookie = request.cookies.get('pb_auth');

		if (!authCookie) {
			// If there's no auth cookie, redirect to login page
			return redirectToLogin(request);
		}

		try {
			const { token, model } = JSON.parse(authCookie.value);

			// If there's no token or it's expired, redirect to login page
			if (!token || isTokenExpired(token)) {
				return redirectToLogin(request);
			}

			// Optionally, you can add the user model to the request headers
			// This can be useful if you need user info in your components
			const requestHeaders = new Headers(request.headers);
			requestHeaders.set('x-user-id', model.id);
			requestHeaders.set('x-user-email', model.email);

			// Continue to the protected route with added headers
			return NextResponse.next({
				request: {
					headers: requestHeaders,
				},
			});
		} catch (e) {
			// If there's an error parsing the cookie, redirect to login
			return redirectToLogin(request);
		}
	}

	// For non-protected routes, continue normally
	return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
	const url = request.nextUrl.clone();
	url.pathname = '/';
	return NextResponse.redirect(url);
}

// You can keep the config.matcher if you prefer, or remove it if you want to use the in-function checks
// export const config = {
//   matcher: ['/dashboard/:path*', '/admin/:path*', '/user/:path*'],
// };