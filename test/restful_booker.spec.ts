import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';

describe('Restful Booker API', () => {
  let token = '';
  let bookingId = 0;
  const firstname = faker.person.firstName();
  const lastname = faker.person.lastName();
  const totalprice = faker.number.int({ min: 100, max: 1000 });
  const additionalneeds = faker.word.noun();
  const novoFirstname = faker.person.firstName();
  const novoLastname = faker.person.lastName();
  const novoTotalprice = faker.number.int({ min: 1001, max: 2000 });
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://restful-booker.herokuapp.com';

  p.request.setDefaultTimeout(90000);

  beforeAll(async () => {
    p.reporter.add(rep);

    token = await p
      .spec()
      .post(`${baseUrl}/auth`)
      .withJson({
        username: 'admin',
        password: 'password123'
      })
      .expectStatus(StatusCodes.OK)
      .expectJsonSchema({
        type: 'object',
        properties: {
          token: {
            type: 'string'
          }
        },
        required: ['token']
      })
      .returns('token');
  });

  describe('Autenticação', () => {
    it('Não deve gerar token com credenciais inválidas', async () => {
      await p
        .spec()
        .post(`${baseUrl}/auth`)
        .withJson({
          username: faker.internet.username(),
          password: faker.internet.password()
        })
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('Bad credentials');
    });
  });

  describe('Reservas', () => {
    it('Deve cadastrar uma nova reserva', async () => {
      bookingId = await p
        .spec()
        .post(`${baseUrl}/booking`)
        .withHeaders('Accept', 'application/json')
        .withJson({
          firstname: firstname,
          lastname: lastname,
          totalprice: totalprice,
          depositpaid: true,
          bookingdates: {
            checkin: '2026-11-01',
            checkout: '2026-11-10'
          },
          additionalneeds: additionalneeds
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          booking: {
            firstname: firstname,
            lastname: lastname
          }
        })
        .expectJsonSchema({
          type: 'object',
          properties: {
            bookingid: {
              type: 'integer'
            },
            booking: {
              type: 'object'
            }
          },
          required: ['bookingid', 'booking']
        })
        .returns('bookingid');
    });

    it('Deve buscar a reserva cadastrada pelo id', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking/${bookingId}`)
        .withHeaders('Accept', 'application/json')
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          firstname: firstname,
          lastname: lastname,
          totalprice: totalprice,
          depositpaid: true,
          bookingdates: {
            checkin: '2026-11-01',
            checkout: '2026-11-10'
          },
          additionalneeds: additionalneeds
        });
    });

    it('Deve encontrar a reserva filtrando por nome e sobrenome', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking`)
        .withQueryParams('firstname', firstname)
        .withQueryParams('lastname', lastname)
        .withHeaders('Accept', 'application/json')
        .expectStatus(StatusCodes.OK)
        .expectJsonLike([{ bookingid: bookingId }]);
    });

    it('Deve atualizar todos os dados da reserva com token', async () => {
      await p
        .spec()
        .put(`${baseUrl}/booking/${bookingId}`)
        .withHeaders('Accept', 'application/json')
        .withHeaders('Cookie', `token=${token}`)
        .withJson({
          firstname: novoFirstname,
          lastname: novoLastname,
          totalprice: novoTotalprice,
          depositpaid: false,
          bookingdates: {
            checkin: '2026-12-01',
            checkout: '2026-12-05'
          },
          additionalneeds: 'Breakfast'
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          firstname: novoFirstname,
          lastname: novoLastname,
          totalprice: novoTotalprice,
          depositpaid: false,
          additionalneeds: 'Breakfast'
        });
    });

    it('Deve atualizar parcialmente a reserva com token', async () => {
      await p
        .spec()
        .patch(`${baseUrl}/booking/${bookingId}`)
        .withHeaders('Accept', 'application/json')
        .withHeaders('Cookie', `token=${token}`)
        .withJson({
          additionalneeds: 'Lunch'
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          firstname: novoFirstname,
          additionalneeds: 'Lunch'
        });
    });

    it('Não deve atualizar a reserva sem token', async () => {
      await p
        .spec()
        .put(`${baseUrl}/booking/${bookingId}`)
        .withHeaders('Accept', 'application/json')
        .withJson({
          firstname: faker.person.firstName(),
          lastname: faker.person.lastName(),
          totalprice: 100,
          depositpaid: true,
          bookingdates: {
            checkin: '2026-12-01',
            checkout: '2026-12-05'
          },
          additionalneeds: 'Dinner'
        })
        .expectStatus(StatusCodes.FORBIDDEN);
    });

    it('Deve excluir a reserva com token', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/booking/${bookingId}`)
        .withHeaders('Cookie', `token=${token}`)
        .expectStatus(StatusCodes.CREATED);
    });

    it('Não deve encontrar a reserva excluída', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking/${bookingId}`)
        .withHeaders('Accept', 'application/json')
        .expectStatus(StatusCodes.NOT_FOUND);
    });
  });

  afterAll(() => p.reporter.end());
});
