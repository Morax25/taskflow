import { DomainError } from '../../utils/domainError.js';
import prisma from '../../config/prisma.js';
import { HttpCode } from '../../utils/statusCode.js';
import { RegisterUserInput } from '../../types/user.types.js';

export const registerUser = async ({
  name,
  email,
  password,
}: RegisterUserInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new DomainError('CONFLICT', 'User with this email already exists', );
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash:password,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return user;
};