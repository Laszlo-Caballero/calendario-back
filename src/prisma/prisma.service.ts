import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaLibSql({
      url: `${process.env.TURSO_DATABASE_URL}`,
      authToken: `${process.env.TURSO_AUTH_TOKEN}`,
    });
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      try {
        await this.$executeRawUnsafe(`ALTER TABLE Todo ADD COLUMN phase TEXT;`);
      } catch {}
      try {
        await this.$executeRawUnsafe(
          `ALTER TABLE Todo ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;`,
        );
      } catch {}
    } catch {}
  }
}
