import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('/health (GET) — returns ok', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect(res => {
        expect(res.body.status).toBe('ok')
        expect(res.body.version).toBe('2.0.0')
      })
  })

  it('/ (GET) — returns API info', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(res => {
        expect(res.body.name).toContain('NEXUS SCHOLAR')
      })
  })

  it('/api/scholarships (GET) — returns paginated list', () => {
    return request(app.getHttpServer())
      .get('/api/scholarships')
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('items')
        expect(res.body).toHaveProperty('total')
        expect(res.body).toHaveProperty('page')
      })
  })

  it('/api/auth/login (POST) — rejects invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'notexist@test.com', password: 'wrongpassword' })
      .expect(401)
  })
})
