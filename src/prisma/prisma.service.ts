import { Injectable } from '@nestjs/common';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaLibSql({
      url: `${process.env.TURSO_DATABASE_URL}`,
      authToken: `${process.env.TURSO_AUTH_TOKEN}`,
    });
    super({ adapter });
  }
}
