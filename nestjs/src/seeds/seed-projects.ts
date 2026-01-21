import { NestFactory } from '@nestjs/core';
import { ProjectService } from '../project/project.service';
import { AppModule } from '../app.module';
import { INestApplicationContext } from '@nestjs/common';

async function seedProjects() {
  // Skip seeding in test and development environments during automated testing
  if (process.env.NODE_ENV === 'test' || (process.env.NODE_ENV === 'development' && process.env.JEST_WORKER_ID !== undefined)) {
    console.log('Skipping seeding in test/development environment');
    return;
  }

  const app: INestApplicationContext = await NestFactory.createApplicationContext(AppModule);

  const projectService = app.get(ProjectService);

  // Define default projects as specified in the requirements
  const defaultProjects = [
    { name: 'Viso Internal', description: 'Internal projects for Viso Academy' },
    { name: 'Client A', description: 'Projects for Client A' },
    { name: 'Client B', description: 'Projects for Client B' },
    { name: 'Personal Development', description: 'Personal skill development activities' },
  ];

  for (const projectData of defaultProjects) {
    try {
      // Attempt to create the project, ignore if it already exists
      await projectService.create(projectData.name, projectData.description);
      console.log(`Created project: ${projectData.name}`);
    } catch (error) {
      // If project already exists, log a message and continue
      if (error.message === 'Project with this name already exists') {
        console.log(`Project already exists: ${projectData.name}`);
      } else {
        console.error(`Error creating project ${projectData.name}:`, error.message);
      }
    }
  }

  await app.close();
}

seedProjects()
  .then(() => console.log('Seeding completed'))
  .catch(error => console.error('Seeding failed:', error));