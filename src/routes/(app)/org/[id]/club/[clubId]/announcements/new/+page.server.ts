import { fail, redirect } from '@sveltejs/kit';
import type { PageParentData, PageServerLoad } from './$types';
import { prisma } from '$lib/prismaConnection';
import { createPermissionsCheck, createPermissionList } from '$lib/permissionHelper';
import { defaultClubPermissionObject } from '$lib/permissions';

export const load: PageServerLoad = async ({ params, parent }) => {
	const parentData: PageParentData = await parent();
	const clubId = params.clubId;
	const orgId = params.id;
	const baseUrl = `/org/${orgId}/club/${clubId}`;

	if (
		!parentData.clubPerms.admin &&
		!parentData.clubPerms.manageAnnouncements &&
		parentData.club.ownerId != parentData.user.id
	) {
		redirect(303, baseUrl);
	}
};

export const actions = {
	createAnnouncement: async ({ request, cookies, params }) => {
		const clubId = params.clubId;
		const orgId = params.id;
		const baseUrl = `/org/${orgId}/club/${clubId}`;

		const FormData = await request.formData();

		const title = FormData.get('title')?.toString();
		const desc = FormData.get('desc')?.toString();

		if (!title) {
			return fail(400, {
				title,
				desc,
				message: 'Missing title'
			});
		}

		// now the long task of validating data
		const session = cookies.get('session');

		const sessionCheck = await prisma.session.findUnique({
			where: {
				sessionToken: session
			},
			include: {
				user: {
					include: {
						clubs: {
							where: {
								id: parseInt(params.clubId)
							}
						},
						clubUsers: {
							where: {
								clubId: parseInt(params.clubId)
							},
							include: {
								role: true
							}
						}
					}
				}
			}
		});

		if (!sessionCheck || !sessionCheck.user) {
			redirect(303, '/login');
		}

		const club = sessionCheck.user.clubs[0];
		const clubUser = sessionCheck.user.clubUsers[0];
		// check permissions

		if (club.ownerId != sessionCheck.userId) {
			if (!clubUser) {
				redirect(303, '/login');
			}
			const permissionCheck = createPermissionsCheck(
				createPermissionList(defaultClubPermissionObject),
				clubUser.role?.permissionInt ?? 0
			);
			if (!permissionCheck.admin && !permissionCheck.manageAnnoucements) {
				redirect(303, '/login');
			}
		}
		//whoo! valid!

		await prisma.announcement.create({
			data: {
				title,
				description: desc,
				clubId: club.id
			}
		});

		//we did it!
		redirect(303, `${baseUrl}/announcements`);
	}
};
