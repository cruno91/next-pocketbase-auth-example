import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
	const { email, password, passwordConfirm } = await request.json();

	try {
		const response = await axios.post('http://db.authexample.lndo.site/api/collections/users/records', {
			email,
			password,
			passwordConfirm,
		});

		return NextResponse.json(response.data, { status: 200 });
	} catch (error: any) {
		if (error.response?.status === 400 && error.response.data?.data?.email?.message) {
			return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
		}

		return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
	}
}
