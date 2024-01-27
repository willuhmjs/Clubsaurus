import type { Cookies } from '@sveltejs/kit';
import crypto from 'crypto';

import { prisma } from './prismaConnection';

export async function createSession(
	userId: number,
	getClientAddress: () => string,
	request: Request,
	cookies: Cookies
) {
	const session = crypto.randomBytes(32).toString('hex');
	await prisma.session.create({
		data: {
			sessionToken: session,
			userId,
			ip: getClientAddress(),
			userAgent: request.headers.get('user-agent')
		}
	});

	cookies.set('session', session, {
		secure: false,
		sameSite: 'strict',
		expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		path: '/'
	});
}
