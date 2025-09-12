import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { z } from 'zod';

import { s3client } from '@/lib/object-storage';

import { envServer } from '@/env/server';
import { zFormFieldsOnboarding } from '@/features/auth/schema';
import { zUser } from '@/features/user/schema';
import { protectedProcedure } from '@/server/orpc';

const tags = ['account'];

export default {
  submitOnboarding: protectedProcedure({
    permission: null,
  })
    .route({
      method: 'POST',
      path: '/account/submit-onboarding',
      tags,
    })
    .input(zFormFieldsOnboarding())
    .output(z.void())
    .handler(async ({ context, input }) => {
      context.logger.info('Update user');
      await context.db.user.update({
        where: { id: context.user.id },
        data: {
          ...input,
          onboardedAt: new Date(),
        },
      });
    }),

  updateInfo: protectedProcedure({
    permission: null,
  })
    .route({
      method: 'POST',
      path: '/account/info',
      tags,
    })
    .input(
      zUser().pick({
        name: true,
        profilePictureId: true,
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      context.logger.info('Update user');

      // If profilePictureId, generate a public link
      if (input.profilePictureId) {
        // Remove old file if there was one (to prevent bucket overloading)
        const deleteCommand = new DeleteObjectCommand({
          Bucket: envServer.S3_BUCKET_NAME,
          Key: context.user.profilePictureId,
        });
        try {
          await s3client.send(deleteCommand);
        } catch (error) {
          context.logger.warn('Fail to delete user profile picture', {
            profilePictureId: context.user.profilePictureId,
            error,
          });
        }

        // [TODO] Check to return an error
        //        Check to move this code into its own rpc
        try {
          await context.db.user.update({
            where: { id: context.user.id },
            data: {
              image: `${envServer.S3_BUCKET_PUBLIC_URL}/${input.profilePictureId}`,
            },
          });
        } catch (error) {
          context.logger.warn('Fail to save user profile picture', {
            profilePictureId: context.user.profilePictureId,
            error,
          });
        }
        return;
      }

      await context.db.user.update({
        where: { id: context.user.id },
        data: {
          name: input.name ?? '',
        },
      });
    }),
};
