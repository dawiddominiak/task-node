# Task node

## Description

It's the cart API that allows user to create and manage their carts.

### Technology stack

The application is built on the top of the NestJS framework.
Although it wasn't required I used SQLite as an in memory database system
to not create efficient data structures from scratch.
I use Jest as a test runner for both `unit` and `e2e` tests.

### Architecture

It's a monolith modular application.
The following modules were implemented:

- cart
  - product
- common
- currency
- database

#### Currency module
The heart of the module is the `CurrencyService`, responsible for keeping currencies up to date. Currencies are updated either during the start of an application and daily at 16:05 CET . Newest currencies are stored in the repository. According to the documentation of https://api.exchangeratesapi.io/latest currencies are updated daily after 4 p.m. CET and should be cached. As the currencies rates are crutial to make the app work correctly I retries to load currencies multiple times in increasing time intervals. The app validates all the response body from the external API before a further processing.

#### Cart/product module

It's the core business logic. There are REST controllers to manipulate the state. All user input is validated. User can create new carts, add products to the cart, remove products from the cart and do the checkout. The checkout automatically recalculates currency to a target currency. Recalculations always must be handled with a special care, because of a bunch of challenges.

At first all the numbers in JavaScript uses IEEE 754 (64 bit) format. Stored numbers are not exact the same numbers as expected. Especially problematic are numbers which mantissa stored in IEEE 754 has a period (like 0.1). The solution is [money pattern](https://www.martinfowler.com/eaaCatalog/money.html) proposed by Martin Fowler.

The second problem is an avoidance of double recalculation. Double recalculation EUR -> PLN -> EUR can give a slightly different result. Intermediate state shouldn't be kept and used again. The app is recalculating the currencies without storing any intermediate states.

The third problem is a residual value. Calculation of 0.02 PLN -> EUR gives us the number 0.00 after rounding. This case is handled and minimum value after recalculation is always 0.01 if the value in the base currency was > 0.

### Limitations
As I was limited by my own time I did a few shortcuts.

At first the scheduler that fetch the daily rates is working along with the application.
It's not efficient in the environment orineted on horizontal scaling.
There should be a separate microservice to fetch the newest currencies.

As I was limited by the product schema, I couldn't change the entity relationships. In other case I'd propose to denormalize our Product to two different entities - `Product` and `Position` in the cart. I also assumed that actor is permitted to propose the product price and currency. Productional applications should rather keep such information in the database and allow the user to only add the product ids and quantities to the cart. On the other hand, the application fit as a microservice to recalculate the price of the user cart.

## Prerequisites

- npm@6.13.6
- node@12.14.1

## Installation

```
npm install
```

## Running
```
npm start
```

## Testing

```
npm test
```

## Documentation

Please, feel free to look at the swagger documentation on an `/api` route.
Link for the localhost and the default port `3000` (http://localhost:3000/api).

## Author

- Dawid Dominiak

## License
MIT licensed
