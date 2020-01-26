import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';

import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  app.use(helmet({
    referrerPolicy: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\"self\"'],
      },
    },
    permittedCrossDomainPolicies: true,
    featurePolicy: {
      features: {
        accelerometer: ['\"none\"'],
        ambientLightSensor: ['\"none\"'],
        autoplay: ['\"none\"'],
        camera: ['\"none\"'],
        documentDomain: ['\"none\"'],
        documentWrite: ['\"none\"'],
        encryptedMedia: ['\"none\"'],
        fontDisplayLateSwap: ['\"none\"'],
        fullscreen: ['\"none\"'],
        geolocation: ['\"none\"'],
        gyroscope: ['\"none\"'],
        layoutAnimations: ['\"none\"'],
        legacyImageFormats: ['\"none\"'],
        loadingFrameDefaultEager: ['\"none\"'],
        magnetometer: ['\"none\"'],
        microphone: ['\"none\"'],
        midi: ['\"none\"'],
        oversizedImages: ['\"none\"'],
        payment: ['\"none\"'],
        pictureInPicture: ['\"none\"'],
        serial: ['\"none\"'],
        speaker: ['\"none\"'],
        syncScript: ['\"none\"'],
        syncXhr: ['\"none\"'],
        unoptimizedImages: ['\"none\"'],
        unoptimizedLosslessImages: ['\"none\"'],
        unoptimizedLossyImages: ['\"none\"'],
        unsizedMedia: ['\"none\"'],
        usb: ['\"none\"'],
        verticalScroll: ['\"none\"'],
        vibrate: ['\"none\"'],
        vr: ['\"none\"'],
        wakeLock: ['\"none\"'],
        xr: ['\"none\"'],
      },
    },
  }));
  app.enableCors();
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('Node task API')
    .setDescription('API to recalculate the cart to different currencies during the checkout.')
    .setContact('Dawid Dominiak', undefined, 'poczta@dawiddominiak.pl')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
