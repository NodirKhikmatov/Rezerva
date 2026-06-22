import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Locale } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('User (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1', { exclude: ['health', 'docs'] });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    const prisma = app.get(PrismaService);
    const jwtService = app.get(JwtService);
    const user = await prisma.user.create({
      data: {
        firstName: 'UserModule',
        locale: Locale.uz,
        notificationPreferences: { create: {} },
      },
    });

    accessToken = jwtService.sign({
      sub: user.id,
      role: user.role,
      locale: user.locale,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/users/me returns profile', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.firstName).toBe('UserModule');
    expect(response.body.locale).toBe(Locale.uz);
    expect(Array.isArray(response.body.identities)).toBe(true);
  });

  it('PATCH /v1/users/me updates profile', async () => {
    const response = await request(app.getHttpServer())
      .patch('/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        firstName: 'Updated',
        lastName: 'Name',
        locale: Locale.ru,
      })
      .expect(200);

    expect(response.body.firstName).toBe('Updated');
    expect(response.body.lastName).toBe('Name');
    expect(response.body.locale).toBe(Locale.ru);
  });

  it('PATCH /v1/users/me rejects invalid email', async () => {
    await request(app.getHttpServer())
      .patch('/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'not-an-email' })
      .expect(400);
  });

  it('GET /v1/users/me requires authentication', async () => {
    await request(app.getHttpServer()).get('/v1/users/me').expect(401);
  });
});
