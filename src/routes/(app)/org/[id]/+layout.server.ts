import { prisma } from '$lib/prismaConnection';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, parent }) => {
	const orgId = parseInt(params.id);
	const { user } = await parent();

	const org = await prisma.organization.findFirst({
		where: {
			id: orgId
		},
		include: {
			clubs: true,
			orgUsers: {
				where: {
					userId: user.id
				}
			}
		}
	});

	if (!org) {
		throw new Error('Organization not found');
	}

	if (!org.orgUsers || org.orgUsers.length == 0) {
		throw error(400, "No Known Org")
	}

	return {
		org,
		clubs: org.clubs,
		orgUser: org.orgUsers[0]
	};
};
