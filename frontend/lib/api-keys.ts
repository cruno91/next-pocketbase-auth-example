import crypto from 'crypto'
import bcrypt from 'bcryptjs'

function generateApiKey() {
	return crypto.randomBytes(32).toString('hex')
}

async function hashApiKey(apiKey) {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(apiKey, salt);
}
