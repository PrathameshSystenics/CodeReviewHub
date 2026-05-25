import { prisma } from "@/prisma";

export async function findVerificationToken(identifier: string, token: string) {
  return await prisma.verificationToken.findFirst({
    where: { identifier, token },
  });
}

export async function createVerificationToken(
  identifier: string,
  token: string,
  expires: Date,
) {
  return await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });
}

export async function deleteVerificationTokensByIdentifier(identifier: string) {
  return await prisma.verificationToken.deleteMany({
    where: { identifier },
  });
}

export async function deleteVerificationToken(
  identifier: string,
  token: string,
) {
  return await prisma.verificationToken.delete({
    where: { identifier_token: { identifier, token } },
  });
}
