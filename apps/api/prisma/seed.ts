import { PrismaClient } from '@prisma/client';
import { createUserFactory } from './factories/user.factory';
import { createProjectFactory } from './factories/project.factory';
import { createTaskFactory } from './factories/task.factory';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando Seeding Masivo...');

  // 1. Limpieza de base de datos
  console.log('Limpiando base de datos...');
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.user.deleteMany();

  // 2. Crear Permisos Básicos
  console.log('Creando permisos...');
  const permissions = [
    { slug: 'project:read', description: 'Ver detalles del proyecto' },
    { slug: 'project:edit', description: 'Editar detalles del proyecto' },
    { slug: 'project:invite', description: 'Invitar miembros al proyecto' },
    { slug: 'task:create', description: 'Crear tareas' },
    { slug: 'task:edit', description: 'Editar tareas' },
    { slug: 'task:delete', description: 'Eliminar tareas' },
    { slug: 'task:assign', description: 'Asignar tareas' },
    { slug: 'comment:create', description: 'Crear comentarios' },
  ];
  await prisma.permission.createMany({ data: permissions });
  const allPerms = await prisma.permission.findMany();

  // 3. Crear Roles Básicos
  console.log('Creando roles...');
  const rolesData = [
    { name: 'OWNER', description: 'Propietario con control total' },
    { name: 'ADMIN', description: 'Administrador del proyecto' },
    { name: 'EDITOR', description: 'Puede editar tareas y proyectos' },
    { name: 'VIEWER', description: 'Solo lectura' },
  ];

  for (const role of rolesData) {
    const createdRole = await prisma.role.create({ data: role });
    let rolePerms = [];
    if (role.name === 'OWNER' || role.name === 'ADMIN') {
      rolePerms = allPerms.map(p => ({ roleId: createdRole.id, permissionId: p.id }));
    } else if (role.name === 'EDITOR') {
      const editorPerms = allPerms.filter(p => !['project:edit', 'project:invite'].includes(p.slug));
      rolePerms = editorPerms.map(p => ({ roleId: createdRole.id, permissionId: p.id }));
    } else {
      const viewerPerms = allPerms.filter(p => p.slug.includes(':read'));
      rolePerms = viewerPerms.map(p => ({ roleId: createdRole.id, permissionId: p.id }));
    }
    if (rolePerms.length > 0) {
      await prisma.rolePermission.createMany({ data: rolePerms });
    }
  }

  const ownerRole = await prisma.role.findFirstOrThrow({ where: { name: 'OWNER' } });

  // 4. Crear Usuarios
  console.log('Creando usuarios base y 20 aleatorios...');
  const devUser = await prisma.user.create({
    data: await createUserFactory({ email: 'dev@kan-todo.com', fullName: 'Dev Admin' }),
  });
  const clientUser = await prisma.user.create({
    data: await createUserFactory({ email: 'client1@test.com', fullName: 'Client One' }),
  });

  const randomUsersData = await Promise.all(
    Array.from({ length: 20 }).map(() => createUserFactory())
  );
  await prisma.user.createMany({ data: randomUsersData });
  const allUsers = await prisma.user.findMany();

  // 5. Crear 100 Proyectos
  console.log('Creando 100 proyectos...');
  const projectsData = Array.from({ length: 100 }).map(() => {
    const randomOwner = faker.helpers.arrayElement(allUsers);
    return createProjectFactory({ ownerId: randomOwner.id });
  });

  // Usamos create para obtener los IDs para las relaciones posteriores
  const createdProjects = [];
  for (const p of projectsData) {
    const proj = await prisma.project.create({ data: p });
    createdProjects.push(proj);
    // Registrar al dueño como miembro OWNER
    await prisma.projectMember.create({
      data: { projectId: proj.id, userId: p.ownerId, roleId: ownerRole.id }
    });
  }

  // 6. Crear 50 Tareas, cada una con 10 Subtareas y 10 Comentarios
  console.log('Creando 50 tareas con subtareas y comentarios...');
  for (let i = 0; i < 50; i++) {
    const randomProject = faker.helpers.arrayElement(createdProjects);
    const randomAssignee = faker.helpers.arrayElement(allUsers);

    const task = await prisma.task.create({
      data: createTaskFactory({
        projectId: randomProject.id,
        assigneeId: randomAssignee.id
      }),
    });

    // 10 Subtareas por tarea
    const subtasks = Array.from({ length: 10 }).map(() => ({
      taskId: task.id,
      title: faker.hacker.verb() + ' ' + faker.hacker.noun(),
      isCompleted: faker.datatype.boolean(),
    }));
    await prisma.subtask.createMany({ data: subtasks });

    // 10 Comentarios por tarea
    const comments = Array.from({ length: 10 }).map(() => ({
      taskId: task.id,
      authorId: faker.helpers.arrayElement(allUsers).id,
      content: faker.lorem.sentence(),
    }));
    await prisma.comment.createMany({ data: comments });
  }

  console.log(`Seeding completado: 22 usuarios, 100 proyectos, 50 tareas, 500 subtareas y 500 comentarios creados.`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
