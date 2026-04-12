import { PrismaClient } from '@prisma/client';
import { createUserFactory } from './factories/user.factory';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando Seeding...');

  // 1. Limpieza de base de datos (Orden importante para integridad referencial futura)
  console.log('Limpiando base de datos...');
  await prisma.user.deleteMany();

  // 2. Crear Usuarios
  console.log('Creando usuarios de prueba...');

  // Usuario Administrador Dev
  const devUser = await createUserFactory({
    email: 'dev@kan-todo.com',
    fullName: 'Dev Admin',
  });

  // Usuario Cliente Fijo (Solicitado)
  const clientUser = await createUserFactory({
    email: 'client1@test.com',
    fullName: 'Client One',
  });

  await prisma.user.createMany({
    data: [devUser, clientUser],
  });

  // Generar otros 20 usuarios aleatorios (Solicitado)
  console.log('Generando 20 usuarios aleatorios...');
  const randomUsersData = await Promise.all(
    Array.from({ length: 20 }).map(() => createUserFactory())
  );

  await prisma.user.createMany({
    data: randomUsersData,
  });

  console.log(`Seeding completado: 22 usuarios creados en total.`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
