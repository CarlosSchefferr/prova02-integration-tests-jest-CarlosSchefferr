# API test automation with Jest and PactumJS

> Simple integration between JestJS and PactumJS.

## GitHub Actions

[![Node.js CI](https://github.com/ugioni/integration-tests-jest/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/ugioni/integration-tests-jest/actions/workflows/node.js.yml)

## SonarCloud

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ugioni_integration-tests-jest&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ugioni_integration-tests-jest)

# Getting Started

### Pactum docs:
 - [PactumJS](https://pactumjs.github.io/)

### Prerequisites:
 - NodeJS `v22`

### How to run?

Inside of the project folder run:

 1. `npm install --save-dev`
 1. `npm run ci`

After that you should see a `./output` folder with some `HTML` reports.

### Docs to Api under tests: 
 - [Dummyjson](https://dummyjson.com/docs)
 - [Gorest](https://gorest.co.in/)
 - [Toolshop API](https://api.practicesoftwaretesting.com/api/documentation)
 - [Deck of Cards](https://deckofcardsapi.com/)
 - [JSON placeholder](https://jsonplaceholder.typicode.com/)
 - [http bin](http://httpbin.org/)
 - [rick and morty api](https://rickandmortyapi.com/documentation/#rest)
 - [Petstore](https://petstore.swagger.io/#/) 
 - [ServeRest](https://serverest.dev/#/)
 - [ServeRest - Datadog](https://p.datadoghq.eu/sb/421fcfee-35ec-11ee-b87f-da7ad0900005-2aaf85264a89d11b7001bcab452a266e?refresh_mode=sliding&theme=light&tpl_var_env%5B0%5D=serverest.dev&from_ts=1699931511294&to_ts=1699932411294&live=true)

## Prova 02 - Restful Booker API

Testes de integração da [Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html), uma API de reservas de hotel, em `test/restful_booker.spec.ts`.

Para rodar só esse arquivo: `npx jest test/restful_booker.spec.ts`

| # | Cenário | Requisição | Resultado esperado |
|---|---------|------------|--------------------|
| - | Gera o token de acesso (`beforeAll`) | `POST /auth` | 200 e JSON schema com `token` |
| 1 | Não deve gerar token com credenciais inválidas | `POST /auth` | 200 e `Bad credentials` |
| 2 | Deve cadastrar uma nova reserva | `POST /booking` | 200, dados enviados e schema com `bookingid` e `booking` |
| 3 | Deve buscar a reserva cadastrada pelo id | `GET /booking/{id}` | 200 e dados iguais aos cadastrados |
| 4 | Deve encontrar a reserva filtrando por nome e sobrenome | `GET /booking?firstname=&lastname=` | 200 e lista contendo o `bookingid` |
| 5 | Deve atualizar todos os dados da reserva com token | `PUT /booking/{id}` | 200 e campos atualizados |
| 6 | Deve atualizar parcialmente a reserva com token | `PATCH /booking/{id}` | 200 e campo `additionalneeds` atualizado |
| 7 | Não deve atualizar a reserva sem token | `PUT /booking/{id}` | 403 |
| 8 | Deve excluir a reserva com token | `DELETE /booking/{id}` | 201 |
| 9 | Não deve encontrar a reserva excluída | `GET /booking/{id}` | 404 |

Os dados são gerados com `@faker-js/faker`, e o token é enviado no header `Cookie: token=<token>`.
