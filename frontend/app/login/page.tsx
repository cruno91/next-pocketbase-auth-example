'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '../actions';

export default function Login() {
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);

		setError(null); // Reset error state before attempting login

		const result = await login(formData);

		if (result.success) {
			router.push('/content');
		} else {
			setError(result.error ?? 'An unexpected error occurred.');
		}
	}

	return (
		<div className="flex items-center justify-center h-screen">
			<div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
				<h2 className="text-2xl font-semibold mb-4">Login</h2>
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label htmlFor="email" className="block text-sm font-medium text-gray-700">
							Email
						</label>
						<input
							type="email"
							name="email"
							className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							placeholder="you@example.com"
							required
						/>
					</div>

					<div className="mb-6">
						<label htmlFor="password" className="block text-sm font-medium text-gray-700">
							Password
						</label>
						<input
							type="password"
							name="password"
							className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							placeholder="••••••••"
							required
						/>
					</div>

					<button
						type="submit"
						className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
					>
						Login
					</button>

					{/* Error message */}
					{error && (
						<p className="mt-4 text-sm text-red-600 text-center">
							{error}
						</p>
					)}
				</form>

				<p className="mt-4 text-sm text-gray-600 text-center">
					Don't have an account?{' '}
					<Link href="/register" className="text-blue-600 hover:underline">
						Register here
					</Link>
				</p>
			</div>
		</div>
	);
}
