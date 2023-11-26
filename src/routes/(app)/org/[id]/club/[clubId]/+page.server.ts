import { prisma } from '$lib/db';
import {
	ceratePermissionsCheck,
	createPermissionList,
	type PermissionObject
} from '$lib/permissionHelper';
import { defaultClubPermissionObject } from '$lib/permissions';
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

type DataUpdateObject = {
	imageURL?: string;
	name?: string;
	description?: string;
};



export const actions = {
	updateClub: async ({ cookies, request, params }) => {
		const formData = await request.formData();
		const imageURL = formData.get('imageURL')?.toString();
		const clubName = formData.get('clubName')?.toString();
		const clubDescription = formData.get('clubDescription')?.toString();

		const dataUpdateObject: DataUpdateObject = {};
		if (imageURL) {
			dataUpdateObject.imageURL = imageURL;
		}
		if (clubName) {
			dataUpdateObject.name = clubName;
		}
		if (clubDescription) {
			dataUpdateObject.description = clubDescription;
		}

		//ensure the user is actually allowed to edit this thing
		const session = cookies.get('session');
		if (!session) {
			throw redirect(303, '/login');
		}
		const sessionCheck = await prisma.session.findFirst({
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
						}
					}
				}
			}
		});
		if (!sessionCheck || !sessionCheck.user) {
			throw redirect(303, '/login');
		}

		const id = parseInt(params.clubId);
		if (!id || Number.isNaN(id)) {
			throw error(500, 'Invalid Club Id');
		}

		//check for permissions
		const club = await prisma.club.findFirst({
			where: {
				id: id
			},
			include: {
				clubUsers: {
					where: {
						id: sessionCheck.user.id
					}
				}
			}
		});

		if (!club) {
			throw error(500, 'Invalid Club Id');
		}

		if (club.ownerId != sessionCheck.user.id) {
			//check if the user has permissions
			if (!club.clubUsers) {
				throw error(500, 'No Permissions');
			}
			const permissionObject = ceratePermissionsCheck(
				createPermissionList(defaultClubPermissionObject),
				club.clubUsers[0].permissions
			);
			if (!permissionObject.admin && !permissionObject.updateAppearance) {
				throw error(500, 'No Permissions');
			}
		}

		// update the club
		await prisma.club.update({
			where: {
				id: parseInt(params.clubId)
			},
			data: dataUpdateObject
		});
	}
};
