import Link from 'next/link';
import { login } from '../actions';

export default function Login() {
	return (
		<div className="flex items-center justify-center h-screen">
			<div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
				<h2 className="text-2xl font-semibold mb-4">Login</h2>
				<form action={login}>
					<div className="mb-4">
						<label htmlFor="email" className="block text-sm font-medium text-gray-700">
							Email
						</label>
						<input
							type="email"
							id="email"
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
							id="password"
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
