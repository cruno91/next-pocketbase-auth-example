import { NextResponse } from 'next/server'
import PocketBase from 'pocketbase';
import { hashApiKey } from "@/lib/api-keys"

const pb = new PocketBase(process.env.POCKETBASE_URL); // Replace with your Pocketbase URL

export async function POST(req: Request) {
	const { name, apiKey } = await req.json();
	const authorization = req.headers.get('authorization');

	// Check if the authorization header is present
	if (!authorization) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Extract the token from the authorization header
	const token = authorization.split(' ')[1];

	if (!token) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Set the auth token manually in PocketBase
		pb.authStore.save(token, null);

		// Try refreshing the authentication session with the current token
		const authData = await pb.collection('users').authRefresh();

		const user = pb.authStore.model;
		if (!user) {
			console.log('AuthData:', authData);
			throw new Error('Invalid token');
		}

		// Hash the API key before storing it in PocketBase
		const hashedApiKey = await hashApiKey(apiKey);

		// Create a new API key record in the PocketBase 'api_keys' collection
		const record = await pb.collection('api_keys').create({
			name, // Store the API key name
			key: hashedApiKey, // Store the hashed API key
			account: user.id, // Associate the API key with the authenticated user
		});

		// Return the newly created API key and details
		return NextResponse.json({
			id: record.id,
			name,
			key: apiKey, // Return the plain API key
			createdAt: record.created,
		});
	} catch (error) {
		console.error('Error creating API key:', error);
		return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
	}
}

export async function GET(req: Request) {
	const authorization = req.headers.get('authorization');

	// Check if the authorization header is present
	if (!authorization) {
		console.log('No authorization header');
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Extract the token from the authorization header
	const token = authorization.split(' ')[1];

	if (!token) {
		console.log('No token found in authorization header');
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Set the auth token manually in PocketBase
		pb.authStore.save(token, null);

		// Try refreshing the authentication session with the current token
		await pb.collection('users').authRefresh();

		const user = pb.authStore.model;
		if (!user) {
			throw new Error('Invalid token');
		}

		// Fetch all API keys associated with the authenticated user, and exclude revoked keys
		const apiKeys = await pb.collection('api_keys').getFullList({
			filter: `account = "${user.id}" && (revoked != true)`,
			fields: 'id, name, created, last_used',
		});

		// Return the user's API keys
		return NextResponse.json(apiKeys);
	} catch (error) {
		console.error('Error fetching API keys:', error);
		// Return an empty array if authorization fails, so the api-keys handles it gracefully
		return NextResponse.json([], { status: 200 });
	}
}

export async function DELETE(req: Request) {
	const authorization = req.headers.get('authorization');
	const url = new URL(req.url);
	const apiKeyId = url.searchParams.get('id'); // Get the key ID from query params

	if (!authorization) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Extract the token from the authorization header
	const token = authorization.split(' ')[1];

	if (!token) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!apiKeyId) {
		return NextResponse.json({ error: 'API key ID is required' }, { status: 400 });
	}

	try {
		// Set the auth token manually in PocketBase
		pb.authStore.save(token, null);

		// Try refreshing the authentication session with the current token
		await pb.collection('users').authRefresh();

		const user = pb.authStore.model;
		if (!user) {
			throw new Error('Invalid token');
		}

		// Check if the key exists and belongs to the authenticated user
		const apiKeyRecord = await pb.collection('api_keys').getOne(apiKeyId);

		if (apiKeyRecord.account !== user.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		// Delete or revoke the API key
		await pb.collection('api_keys').delete(apiKeyId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error revoking API key:', error);
		return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
	}
}
