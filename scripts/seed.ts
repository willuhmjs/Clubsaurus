import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { promisify } from 'util';

const pbkdf2 = promisify(crypto.pbkdf2);

const prisma = new PrismaClient();

interface PasswordData {
	hash: string;
	salt: string;
}

async function makePassword(password: string): Promise<PasswordData> {
	const salt = crypto.randomBytes(32).toString('hex');
	const hash = (await pbkdf2(password, salt, 1000, 100, 'sha512')).toString('hex');

	return { hash, salt };
}

async function main() {
	const org = await prisma.organization.findFirst({ where: { id: 1 } });

	if (org && org.name != 'Cardboard') {
		throw new Error(
			'Organization with id 1 already exists and is not Cardboard. Are you sure this is the right database?'
		);
	}

	console.log('Seeding database...');

	const bStone = await prisma.user.upsert({
		where: { email: 'bstone@card.board' },
		update: {},
		create: {
			firstName: 'Brick',
			lastName: 'Stone',
			email: 'bstone@card.board',
			...(await makePassword('password'))
		}
	});

	const leaderUser = await prisma.user.upsert({
		where: { email: 'leader@card.board' },
		update: {},
		create: {
			firstName: 'Card',
			lastName: 'Board',
			email: 'leader@card.board',
			...(await makePassword('password'))
		}
	});

	await prisma.organization.upsert({
		where: { id: 1, name: 'Cardboard' },
		update: {},
		create: {
			name: 'Cardboard',
			joinCode: '123456',
			ownerId: leaderUser.id,
			orgUsers: {
				create: [
					{
						userId: bStone.id,
						role: 'ADMIN'
					},
					{
						userId: leaderUser.id,
						role: 'OWNER'
					}
				]
			},
			clubs: {
				create: [
					{
						name: 'Cardboard Club',
						clubUsers: {
							create: [
								{
									organizationId: 1,
									userId: bStone.id,
									owner: true
								}
							]
						},
						imageURL:
							'https://static01.nyt.com/images/2022/12/04/magazine/04mag-cardboard-copy/04mag-cardboard-copy-facebookJumbo-v2.jpg'
					},
					{
						name: 'Board Game Club',
						clubUsers: {
							create: [
								{
									organizationId: 1,
									userId: bStone.id,
									owner: true
								}
							]
						},
						imageURL: 'https://media.timeout.com/images/105627949/750/422/image.jpg',
						announcements: {
							create: [
								{
									title: 'Checkers Tournament',
									description:
										'Ariane and Ling won the regional checkers tournament! Congratulations!'
								}
							]
						}
					},
					{
						name: 'Math Club',
						clubUsers: {
							create: [
								{
									organizationId: 1,
									userId: bStone.id,
									owner: true
								}
							]
						},
						imageURL:
							'https://www.the74million.org/wp-content/uploads/2023/02/iStock-470493341-copy.jpg'
					},
					{
						name: 'Football Club',
						clubUsers: {
							create: [
								{
									organizationId: 1,
									userId: bStone.id,
									owner: true
								}
							]
						},
						imageURL:
							'https://daily.jstor.org/wp-content/uploads/2018/06/soccer_europe_1050x700.jpg'
					}
				]
			}
		}
	});

	await prisma.organization.upsert({
		where: { id: 2, name: 'Hybrid' },
		update: {},
		create: {
			name: 'Hybrid',
			joinCode: '234567',
			owner: {
				create: {
					firstName: 'Hy',
					lastName: 'Brid',
					email: 'hbrid@hybrid.org',
					...(await makePassword('password'))
				}
			},
			orgUsers: {
				create: [
					{
						role: 'ADMIN',
						user: {
							create: {
								firstName: 'Animal',
								lastName: 'Bird',
								email: 'abird@hybrid.org',
								...(await makePassword('password'))
							}
						}
					}
				]
			}
		}
	});

	console.log('Generating test users...');

	for (let i = 0; i < 100; i++) {
		await prisma.user.upsert({
			where: {
				id: i + 1
			},
			update: {},
			create: {
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				email: `${i}.test.user@clubsaur.us`,
				...(await makePassword('password')),
				orgUsers: {
					create: {
						organizationId: 1,
						role: 'STUDENT'
					}
				},
				clubUsers: {
					create: {
						clubId: Math.ceil(Math.random() * 4),
						organizationId: 1,
						owner: false
					}
				}
			}
		});
	}

	console.log('Database seeded!');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
