import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(email: string, name: string, password: string) {
    return this.prisma.user.create({
      data: { email, name, password },
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }
}
