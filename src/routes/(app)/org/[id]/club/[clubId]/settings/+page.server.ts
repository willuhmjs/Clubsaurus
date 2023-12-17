import { formHandler } from '$lib/bodyguard.js';
import {
	createPermissionList,
	createPermissionsCheck,
	type PermissionObject
} from '$lib/permissionHelper.js';
import { defaultClubPermissionObject } from '$lib/permissions.js';
import { prisma } from '$lib/prismaConnection.js';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async () => {
	return {};
};

export const actions = {
	updateClub: formHandler(
		z.object({
			clubName: z.string().max(100).min(1).optional(),
			imgURL: z.string().optional()
		}),
		async ({ clubName, imgURL }, { cookies, params }) => {
			const session = cookies.get('session');

			if (!session) {
				redirect(303, '/login');
			}

			if (!clubName) {
				return {
					success: false,
					message: 'Must specify a club name'
				};
			}

			const club = await prisma.club.findFirst({
				where: {
					id: parseInt(params.clubId)
				}
			});

			if (!club) {
				return {
					success: false,
					message: 'how did we get here'
				};
			}

			const sessionCheck = await prisma.session.findUnique({
				where: {
					sessionToken: session
				},
				include: {
					user: {
						include: {
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

			//make sure this user is signed in
			let userPermission = { ...defaultClubPermissionObject };

			if (sessionCheck.user.clubUsers[0]) {
				userPermission = {
					...defaultClubPermissionObject,
					...createPermissionsCheck(
						createPermissionList(defaultClubPermissionObject),
						sessionCheck.user.clubUsers[0].role?.permissionInt ?? 0
					)
				};
			} else if (club.ownerId == sessionCheck.user.id) {
				for (const key of Object.keys(userPermission)) {
					(userPermission as PermissionObject)[key] = true;
				}
			}

			if (!userPermission.admin && !userPermission.updateAppearance) {
				return {
					success: false,
					message: 'No Permissions'
				};
			}

			type ClubDataObject = {
				name: string;
				imageURL?: string;
			};

			const dataObject: ClubDataObject = {
				name: clubName
			};

			if (imgURL) {
				dataObject.imageURL = imgURL;
			}

			//now we can update the club
			await prisma.club.update({
				where: {
					id: parseInt(params.clubId)
				},
				data: dataObject
			});

			return {
				success: true,
				message: 'success!'
			};
		}
	)
};
