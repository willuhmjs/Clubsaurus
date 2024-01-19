import { redirect } from '@sveltejs/kit';
import crypto from 'crypto';
import { promisify } from 'util';
import { z } from 'zod';

import { formHandler } from '$lib/bodyguard.js';
import { prisma } from '$lib/server/prismaConnection.js';

const pbkdf2 = promisify(crypto.pbkdf2);

export const actions = {
	login: formHandler(
		z.object({
			email: z.string().email(),
			password: z.string().min(1)
		}),
		async ({ email, password }, { cookies }) => {
			// Pull the user from the database
			const user = await prisma.user.findFirst({
				where: {
					email: email.toLowerCase()
				}
			});

			if (!user) {
				return {
					success: false,
					message: 'Email or password is incorrect.'
				};
			}

			// Get the salt and rehash the password
			const salt = user.salt;
			const hash = (await pbkdf2(password, salt, 1000, 100, 'sha512')).toString('hex');

			if (hash !== user.hash) {
				return {
					success: false,
					message: 'Email or password is incorrect.'
				};
			}

			// Generate a new session for the user
			const session = crypto.randomBytes(32).toString('hex');
			await prisma.session.create({
				data: {
					userId: user.id,
					sessionToken: session
				}
			});

			cookies.set('session', session, {
				secure: true,
				sameSite: 'strict',
				expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
				path: '/'
			});

			redirect(303, '/dashboard');
		}
	)
};
