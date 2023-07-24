import { createNextRoute } from '@ts-rest/next';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';

import { contract } from '@/api/contract';
import { db } from '@/api/db';
import {
  apiGuard,
  errorResponseBadRequest,
  errorResponseNotFound,
  errorResponseNotSignedIn,
} from '@/api/helpers';
import {
  userErrorResponse,
  userFormatFromDb,
  userPrepareForDb,
} from '@/features/users/helpers.server';

export const accountRouter = createNextRoute(contract.account, {
  get: async ({ req }) => {
    const { success, errorResponse, user } = await apiGuard(req);
    if (!success) return errorResponse;
    if (!user) return errorResponseNotSignedIn;

    return {
      status: 200,
      body: user,
    };
  },

  activate: async ({ req, query }) => {
    const { success, errorResponse } = await apiGuard(req, { public: true });
    if (!success) return errorResponse;

    // Clear all expired tokens
    await db.verificationToken.deleteMany({
      where: { expires: { lt: new Date() } },
    });

    const verificationToken = await db.verificationToken.findUnique({
      where: { token: query.key },
    });
    if (!verificationToken) return errorResponseBadRequest;

    const [user] = await db.$transaction([
      db.user.update({
        where: { id: verificationToken.userId },
        data: { activated: true },
      }),
      db.verificationToken.delete({
        where: { token: verificationToken.token },
      }),
    ]);
    if (!user) return errorResponseBadRequest;

    return { status: 200, body: undefined };
  },

  register: async ({ req, body }) => {
    const { success, errorResponse } = await apiGuard(req, { public: true });
    if (!success) return errorResponse;
    const passwordHash = await bcrypt.hash(body.password, 12);

    let user;
    try {
      user = await db.user.create({
        data: userPrepareForDb({
          email: body.email.toLowerCase().trim(),
          login: body.login.toLowerCase().trim(),
          password: passwordHash,
          langKey: body.langKey,
        }),
      });
    } catch (e) {
      return userErrorResponse(e);
    }

    const token = randomUUID();
    await db.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expires: dayjs().add(1, 'hour').toDate(),
      },
    });

    // REPLACE ME WITH EMAIL SERVICE
    console.log(`👇👇👇👇👇👇👇👇👇👇
✉️ Activation link: ${process.env.NEXT_PUBLIC_BASE_URL}/app/account/activate?key=${token}
👆👆👆👆👆👆👆👆👆👆`);

    return { status: 200, body: undefined };
  },

  resetPasswordInit: async ({ req }) => {
    const { success, errorResponse, user } = await apiGuard(req, {
      public: true,
    });
    if (!success) return errorResponse;
    if (!user) return errorResponseNotSignedIn;

    const token = randomUUID();
    await db.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expires: dayjs().add(1, 'hour').toDate(),
      },
    });

    // REPLACE ME WITH EMAIL SERVICE
    console.log(`👇👇👇👇👇👇👇👇👇👇
  ✉️ Reset password link: ${process.env.NEXT_PUBLIC_BASE_URL}/app/account/reset/finish?key=${token}
  👆👆👆👆👆👆👆👆👆👆`);

    return {
      status: 200,
      body: undefined,
    };
  },

  resetPasswordFinish: async ({ req, body }) => {
    const { success, errorResponse } = await apiGuard(req, { public: true });
    if (!success) return errorResponse;
    // Clear all expired tokens
    await db.verificationToken.deleteMany({
      where: { expires: { lt: new Date() } },
    });

    const verificationToken = await db.verificationToken.findUnique({
      where: { token: body.key },
    });

    if (!verificationToken) return errorResponseBadRequest;

    const passwordHash = await bcrypt.hash(body.newPassword, 12);

    const [updatedUser] = await db.$transaction([
      db.user.update({
        where: { id: verificationToken.userId },
        data: { password: passwordHash },
      }),
      db.verificationToken.delete({ where: { token: body.key } }),
    ]);

    const user = userFormatFromDb(updatedUser);
    if (!user)
      return {
        status: 400,
        body: { title: 'Invalid token', errorKey: 'error.invalidToken' },
      };

    return {
      status: 200,
      body: undefined,
    };
  },

  update: async ({ req, body }) => {
    const { success, errorResponse, user } = await apiGuard(req);
    if (!success) return errorResponse;
    if (!user) return errorResponseNotSignedIn;

    const userUpdated = userFormatFromDb(
      await db.user.update({
        where: { id: user.id },
        data: userPrepareForDb(body),
      })
    );

    if (!userUpdated) return errorResponseNotFound;

    return {
      status: 200,
      body: userUpdated,
    };
  },

  updatePassword: async ({ req, body }) => {
    const { success, errorResponse, user } = await apiGuard(req);
    if (!success) return errorResponse;
    if (!user) return errorResponseNotSignedIn;

    const currentUser = await db.user.findUnique({ where: { id: user.id } });
    if (!currentUser?.password) return errorResponseBadRequest;

    const isPasswordValid = await bcrypt.compare(
      body.currentPassword,
      currentUser.password
    );
    if (!isPasswordValid) return errorResponseBadRequest;

    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    await db.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
      },
    });

    return {
      status: 200,
      body: undefined,
    };
  },
});
