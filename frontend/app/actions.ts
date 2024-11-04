'use server';

import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
import {redirect} from "next/navigation";

export async function login(formData: FormData) {
	function isPocketBaseError(error: unknown): error is { status: number } {
		return (
			typeof error === 'object' &&
			error !== null &&
			'status' in error &&
			typeof (error as { status: unknown }).status === 'number'
		);
	}


	const email = formData.get('email') as string;
	const password = formData.get('password') as string;

	const pb = new PocketBase(process.env.POCKETBASE_URL);

	try {
		const { token, record: model } = await pb
			.collection('users')
			.authWithPassword(email, password);

		const cookie = JSON.stringify({ token, model });

		cookies().set('pb_auth', cookie, {
			secure: true,
			path: '/',
			sameSite: 'strict',
			httpOnly: true,
		});

		// Return a status instead of using redirect
		return { success: true };
	} catch (error) {
		console.error('Login failed:', error);

		if (isPocketBaseError(error) && error.status === 400) {
			return { success: false, error: 'Invalid email or password.' };
		} else {
			return { success: false, error: 'An unexpected error occurred. Please try again.' };
		}
	}
}

export async function logout() {
	cookies().delete('pb_auth');
	redirect('/');
}

export async function register(email: string, password: string) {
	const pb = new PocketBase(process.env.POCKETBASE_URL);

	try {
		// Create a new user
		const user = await pb.collection('users').create({
			email,
			password,
			passwordConfirm: password,
		});

		return { success: true, user };
	} catch (error) {
		console.error('Registration failed:', error);

		if (error instanceof Error && error.message) {
			return { success: false, error: error.message };
		} else {
			return { success: false, error: 'An unexpected error occurred. Please try again.' };
		}
	}
}
