import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';

import { migrateDocument, migrations } from '../../../shared/migrations';

// importing MONGOHQ_URL so we can mock it in testing.
import { MONGOHQ_URL } from '../utils/env';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: ReturnType<typeof extendClient>;
  }
}

const prismaPlugin: FastifyPluginAsync = fp(async (server, _options) => {
  const prisma = extendClient(
    new PrismaClient({
      datasources: {
        db: {
          url: MONGOHQ_URL
        }
      }
    })
  );

  await prisma.$connect();

  server.decorate('prisma', prisma);

  server.addHook('onClose', async server => {
    await server.prisma.$disconnect();
  });
});

const LATEST_SCHEMA_VERSION = [...migrations].pop()?.schemaVersion;

// TODO: It would be nice to split this up into multiple update functions,
//       but the types are a pain.
// TODO: Multiple extended clients can be used for different restrictions (e.g. session vs non-session users)
// TODO: Could be used to add other _easily forgotten_ fields like `progressTimestamp`
function extendClient(prisma: PrismaClient) {
  return prisma.$extends({
    query: {
      user: {
        // Migrate all touched documents, before reading/writing to them
        async findFirst({ args, query }) {
          const existingOr = args.where?.OR || [];
          const newArgs = {
            ...args,
            where: {
              ...args.where,
              OR: [
                ...existingOr,
                { schemaVersion: { lt: LATEST_SCHEMA_VERSION } }
              ]
            }
          };
          const user = await prisma.user.findFirst({ ...newArgs });
          if (user) {
            const updatedUser = migrateDocument(user);
            await prisma.user.update({
              where: { id: updatedUser.id },
              data: updatedUser
            });
          }

          return query(args);
        },

        async findMany({ args, query }) {
          const existingOr = args.where?.OR || [];
          const newArgs = {
            ...args,
            where: {
              ...args.where,
              OR: [
                ...existingOr,
                { schemaVersion: { lt: LATEST_SCHEMA_VERSION } }
              ]
            }
          };
          const users = await prisma.user.findMany({ ...newArgs });
          for (const user of users) {
            const updatedUser = migrateDocument(user);
            await prisma.user.update({
              where: { id: updatedUser.id },
              data: updatedUser
            });
          }

          return query(args);
        },

        async findUnique({ args, query }) {
          const existingOr = args.where.OR || [];
          const newArgs = {
            ...args,
            where: {
              ...args.where,
              OR: [
                ...existingOr,
                { schemaVersion: { lt: LATEST_SCHEMA_VERSION } }
              ]
            }
          };
          const user = await prisma.user.findUnique({ ...newArgs });
          if (user) {
            const updatedUser = migrateDocument(user);
            await prisma.user.update({
              where: { id: updatedUser.id },
              data: updatedUser
            });
          }

          return query(args);
        },

        async findFirstOrThrow({ args, query }) {
          const existingOr = args.where?.OR || [];
          const newArgs = {
            ...args,
            where: {
              ...args.where,
              OR: [
                ...existingOr,
                { schemaVersion: { lt: LATEST_SCHEMA_VERSION } }
              ]
            }
          };
          const user = await prisma.user.findFirst({ ...newArgs });
          if (user) {
            const updatedUser = migrateDocument(user);
            await prisma.user.update({
              where: { id: updatedUser.id },
              data: updatedUser
            });
          }

          return query(args);
        },

        async findUniqueOrThrow({ args, query }) {
          const existingOr = args.where.OR || [];
          const newArgs = {
            ...args,
            where: {
              ...args.where,
              OR: [
                ...existingOr,
                { schemaVersion: { lt: LATEST_SCHEMA_VERSION } }
              ]
            }
          };
          const user = await prisma.user.findUnique({ ...newArgs });
          if (user) {
            const updatedUser = migrateDocument(user);
            await prisma.user.update({
              where: { id: updatedUser.id },
              data: updatedUser
            });
          }

          return query(args);
        },

        async update({ args, query }) {
          const existingOr = args.where.OR || [];
          const newArgs = {
            ...args,
            // TODO: Check this is allowed
            // NOTE: The reason to do this is the args for an `updateMany` op are being passed into a `findMany` op.
            // `data` is not allowed in a `findMany`.
            data: undefined as never,
            where: {
              ...args.where,
              OR: [
                ...existingOr,
                { schemaVersion: { lt: LATEST_SCHEMA_VERSION } }
              ]
            }
          };
          const user = await prisma.user.findUnique({ ...newArgs });
          if (user) {
            const updatedUser = migrateDocument(user);
            await prisma.user.update({
              where: { id: updatedUser.id },
              data: updatedUser
            });
          }

          return query(args);
        },

        async updateMany({ args, query }) {
          const existingOr = args.where?.OR || [];
          const newArgs = {
            ...args,
            // TODO: Check this is allowed
            // NOTE: The reason to do this is the args for an `updateMany` op are being passed into a `findMany` op.
            // `data` is not allowed in a `findMany`.
            data: undefined as never,
            where: {
              ...args.where,
              OR: [
                ...existingOr,
                { schemaVersion: { lt: LATEST_SCHEMA_VERSION } }
              ]
            }
          };
          const users = await prisma.user.findMany({ ...newArgs });
          for (const user of users) {
            const updatedUser = migrateDocument(user);
            await prisma.user.update({
              where: { id: updatedUser.id },
              data: updatedUser
            });
          }

          return query(args);
        },

        async upsert({ args, query }) {
          const existingOr = args.where.OR || [];
          const newArgs = {
            ...args,
            // TODO: Check this is allowed
            // NOTE: The reason to do this is the args for an `upsert` op are being passed into a `findUnique` op.
            // `create` and `update` are not allowed in a `findUnique`.
            create: undefined as never,
            update: undefined as never,
            where: {
              ...args.where,
              OR: [
                ...existingOr,
                { schemaVersion: { lt: LATEST_SCHEMA_VERSION } }
              ]
            }
          };
          const user = await prisma.user.findUnique({ ...newArgs });
          if (user) {
            const updatedUser = migrateDocument(user);
            await prisma.user.update({
              where: { id: updatedUser.id },
              data: updatedUser
            });
          }

          return query(args);
        }

        // NOTE: raw ops are untouched, as it is meant to be a direct passthrough to mongodb
        // async findRaw({ model, operation, args, query }) {}
        // async aggregateRaw({ model, operation, args, query }) {}
      }
    }
  });
}

export default prismaPlugin;
