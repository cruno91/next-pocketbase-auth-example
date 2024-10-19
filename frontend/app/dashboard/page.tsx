import { cookies } from 'next/headers';
import { logout } from '../actions';
import ApiKeyDashboardClient from '@/components/api-key-dashboard-client';

async function getApiKeys(token: string) {
	// Replace with your actual API endpoint
	const response = await fetch('https://your-api-endpoint.com/api/api-keys', {
		headers: {
			'Authorization': `Bearer ${token}`,
		},
		cache: 'no-store',
	});

	if (!response.ok) {
		throw new Error('Failed to fetch API keys');
	}

	return response.json();
}

export default async function ApiKeyDashboard() {
	const cookieStore = cookies();
	const authCookie = cookieStore.get('pb_auth');

	if (!authCookie) {
		return <div>Not authenticated</div>;
	}

	const { token, model } = JSON.parse(authCookie.value);
	let apiKeys = [];

	try {
		apiKeys = await getApiKeys(token);
	} catch (error) {
		console.error('Failed to fetch API keys:', error);
		// You could set `apiKeys` to an empty array or any value that indicates an error occurred
		apiKeys = []; // Optional: Indicate error here (e.g., `null` or `[]`)
	}

	return (
		<main>
			{/* Render the ApiKeyDashboardClient regardless of the fetch success */}
			<ApiKeyDashboardClient initialApiKeys={apiKeys} user={model} token={token} />
		</main>
	);
}
