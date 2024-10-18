'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link"

export default function Register() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage('');

		if (password !== confirmPassword) {
			setErrorMessage("Passwords don't match");
			return;
		}

		try {
			const res = await fetch('/api/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password, passwordConfirm: confirmPassword }),
			});

			const data = await res.json();

			if (res.ok) {
				router.push('/login');
			} else {
				setErrorMessage(data.error || 'Registration failed.');
			}
		} catch (error) {
			setErrorMessage('An unexpected error occurred. Please try again.');
		}
	};

	return (
		<div className="flex items-center justify-center h-screen">
			<div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
				<h2 className="text-2xl font-semibold mb-4">Register</h2>
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label htmlFor="email" className="block text-sm font-medium text-gray-700">
							Email
						</label>
						<input
							type="email"
							id="email"
							className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className="mb-4">
						<label htmlFor="password" className="block text-sm font-medium text-gray-700">
							Password
						</label>
						<input
							type="password"
							id="password"
							className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					<div className="mb-6">
						<label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
							Confirm Password
						</label>
						<input
							type="password"
							id="confirm-password"
							className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							placeholder="••••••••"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
					</div>

					{errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
					<button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
						Register
					</button>
				</form>

				<p className="mt-4 text-sm text-gray-600 text-center">
					Already have an account?{' '}
					<Link href="/login" className="text-blue-600 hover:underline">
						Login here
					</Link>
				</p>
			</div>
		</div>
	);
}
