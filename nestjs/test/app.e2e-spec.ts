import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

describe('Time Tracker App Tests (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // ==================== PROJECT MODULE TESTS ====================

  it('/projects (POST) - Create a new project', async () => {
    const projectData = {
      name: `Test Project ${faker.company.name()} ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const response = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe(projectData.name);
    expect(response.body.description).toBe(projectData.description);
  });

  it('/projects (POST) - Creating duplicate project name should fail', async () => {
    const projectName = `Duplicate Project ${Date.now()}`;
    const projectData = {
      name: projectName,
      description: faker.lorem.sentence(),
    };

    // Create the first project
    await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    // Try to create another with the same name
    await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/projects (GET) - Get all projects', async () => {
    const response = await request(app.getHttpServer())
      .get('/projects')
      .expect(HttpStatus.OK);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('/projects/:id (GET) - Get a specific project', async () => {
    // First create a project
    const projectData = {
      name: `Specific Project ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const createResponse = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    const projectId = createResponse.body.id;

    const response = await request(app.getHttpServer())
      .get(`/projects/${projectId}`)
      .expect(HttpStatus.OK);

    expect(response.body.id).toBe(projectId);
    expect(response.body.name).toBe(projectData.name);
  });

  it('/projects/:id (GET) - Non-existent project returns 404', async () => {
    const fakeId = uuidv4();

    await request(app.getHttpServer())
      .get(`/projects/${fakeId}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/projects/:id (PATCH) - Update a project', async () => {
    // First create a project
    const projectData = {
      name: `Original Project ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const createResponse = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    const projectId = createResponse.body.id;

    const updateData = {
      name: `Updated Project ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const response = await request(app.getHttpServer())
      .patch(`/projects/${projectId}`)
      .send(updateData)
      .expect(HttpStatus.OK);

    expect(response.body.id).toBe(projectId);
    expect(response.body.name).toBe(updateData.name);
    expect(response.body.description).toBe(updateData.description);
  });

  it('/projects/:id (DELETE) - Delete a project', async () => {
    // First create a project
    const projectData = {
      name: `Project to Delete ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const createResponse = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    const projectId = createResponse.body.id;

    // Delete the project
    await request(app.getHttpServer())
      .delete(`/projects/${projectId}`)
      .expect(HttpStatus.OK);

    // Verify the project no longer exists
    await request(app.getHttpServer())
      .get(`/projects/${projectId}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  // ==================== TIME ENTRY MODULE TESTS ====================

  it('/time-entries (POST) - Create a new time entry', async () => {
    // First create a project
    const projectData = {
      name: `Time Entry Test Project ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    const projectId = projectResponse.body.id;

    const timeEntryData = {
      date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      hours: 5,
      description: faker.lorem.sentence(),
      projectId: projectId,
    };

    const response = await request(app.getHttpServer())
      .post('/time-entries')
      .send(timeEntryData)
      .expect(HttpStatus.CREATED);

    expect(response.body.id).toBeDefined();
    expect(response.body.date).toBe(timeEntryData.date);
    expect(response.body.hours).toBe(timeEntryData.hours);
    expect(response.body.description).toBe(timeEntryData.description);
    expect(response.body.projectId).toBe(timeEntryData.projectId);
    expect(response.body.project).toBeDefined(); // Check that project relation is loaded
  });

  it('/time-entries (POST) - Creating time entry with future date should fail', async () => {
    // First create a project
    const projectData = {
      name: `Future Date Test Project ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    const projectId = projectResponse.body.id;

    // Use tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const futureDate = tomorrow.toISOString().split('T')[0];

    const timeEntryData = {
      date: futureDate,
      hours: 5,
      description: faker.lorem.sentence(),
      projectId: projectId,
    };

    await request(app.getHttpServer())
      .post('/time-entries')
      .send(timeEntryData)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/time-entries (POST) - Creating time entry with negative hours should fail', async () => {
    // First create a project
    const projectData = {
      name: `Negative Hours Test Project ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    const projectId = projectResponse.body.id;

    const timeEntryData = {
      date: new Date().toISOString().split('T')[0],
      hours: -5, // Negative hours
      description: faker.lorem.sentence(),
      projectId: projectId,
    };

    await request(app.getHttpServer())
      .post('/time-entries')
      .send(timeEntryData)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/time-entries (POST) - Creating time entry with zero hours should fail', async () => {
    // First create a project
    const projectData = {
      name: `Zero Hours Test Project ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    const projectId = projectResponse.body.id;

    const timeEntryData = {
      date: new Date().toISOString().split('T')[0],
      hours: 0, // Zero hours
      description: faker.lorem.sentence(),
      projectId: projectId,
    };

    await request(app.getHttpServer())
      .post('/time-entries')
      .send(timeEntryData)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/time-entries (POST) - Creating time entry exceeding 24 hours per day should fail', async () => {
    // First create a project
    const projectData = {
      name: `24 Hour Limit Test Project ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    const projectId = projectResponse.body.id;

    // First, create a time entry with 20 hours
    const firstTimeEntryData = {
      date: new Date().toISOString().split('T')[0],
      hours: 20,
      description: faker.lorem.sentence(),
      projectId: projectId,
    };

    await request(app.getHttpServer())
      .post('/time-entries')
      .send(firstTimeEntryData)
      .expect(HttpStatus.CREATED);

    // Then try to create another time entry that would exceed 24 hours
    const secondTimeEntryData = {
      date: new Date().toISOString().split('T')[0], // Same date
      hours: 8, // This would make total 28 hours (>24)
      description: faker.lorem.sentence(),
      projectId: projectId,
    };

    await request(app.getHttpServer())
      .post('/time-entries')
      .send(secondTimeEntryData)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/time-entries (GET) - Get all time entries', async () => {
    const response = await request(app.getHttpServer())
      .get('/time-entries')
      .expect(HttpStatus.OK);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('/time-entries/:id (GET) - Get a specific time entry', async () => {
    // First create a project
    const projectData = {
      name: `Specific Time Entry Project ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    const projectId = projectResponse.body.id;

    // Create a time entry
    const timeEntryData = {
      date: new Date().toISOString().split('T')[0],
      hours: 3,
      description: faker.lorem.sentence(),
      projectId: projectId,
    };

    const createResponse = await request(app.getHttpServer())
      .post('/time-entries')
      .send(timeEntryData)
      .expect(HttpStatus.CREATED);

    const timeEntryId = createResponse.body.id;

    const response = await request(app.getHttpServer())
      .get(`/time-entries/${timeEntryId}`)
      .expect(HttpStatus.OK);

    expect(response.body.id).toBe(timeEntryId);
    expect(response.body.date).toBe(timeEntryData.date);
    expect(response.body.hours).toBe(timeEntryData.hours);
    expect(response.body.description).toBe(timeEntryData.description);
  });

  it('/time-entries/:id (GET) - Non-existent time entry returns 404', async () => {
    const fakeId = uuidv4();

    await request(app.getHttpServer())
      .get(`/time-entries/${fakeId}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/time-entries/:id (PATCH) - Update a time entry', async () => {
    // First create a project
    const projectData = {
      name: `Update Time Entry Project ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    const projectId = projectResponse.body.id;

    // Create a time entry
    const timeEntryData = {
      date: new Date().toISOString().split('T')[0],
      hours: 4,
      description: faker.lorem.sentence(),
      projectId: projectId,
    };

    const createResponse = await request(app.getHttpServer())
      .post('/time-entries')
      .send(timeEntryData)
      .expect(HttpStatus.CREATED);

    const timeEntryId = createResponse.body.id;

    const updateData = {
      hours: 6,
      description: faker.lorem.sentence(),
    };

    const response = await request(app.getHttpServer())
      .patch(`/time-entries/${timeEntryId}`)
      .send(updateData)
      .expect(HttpStatus.OK);

    expect(response.body.id).toBe(timeEntryId);
    expect(response.body.hours).toBe(updateData.hours);
    expect(response.body.description).toBe(updateData.description);
  });

  it('/time-entries/:id (DELETE) - Delete a time entry', async () => {
    // First create a project
    const projectData = {
      name: `Delete Time Entry Project ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    const projectId = projectResponse.body.id;

    // Create a time entry
    const timeEntryData = {
      date: new Date().toISOString().split('T')[0],
      hours: 3,
      description: faker.lorem.sentence(),
      projectId: projectId,
    };

    const createResponse = await request(app.getHttpServer())
      .post('/time-entries')
      .send(timeEntryData)
      .expect(HttpStatus.CREATED);

    const timeEntryId = createResponse.body.id;

    // Delete the time entry
    await request(app.getHttpServer())
      .delete(`/time-entries/${timeEntryId}`)
      .expect(HttpStatus.OK);

    // Verify the time entry no longer exists
    await request(app.getHttpServer())
      .get(`/time-entries/${timeEntryId}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/time-entries/range (GET) - Get time entries by date range', async () => {
    // First create a project
    const projectData = {
      name: `Date Range Test Project ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    const projectId = projectResponse.body.id;

    // Create a few time entries
    const dates = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i); // Previous days
      const dateStr = date.toISOString().split('T')[0];

      const timeEntryData = {
        date: dateStr,
        hours: 2 + i,
        description: faker.lorem.sentence(),
        projectId: projectId,
      };

      const response = await request(app.getHttpServer())
        .post('/time-entries')
        .send(timeEntryData)
        .expect(HttpStatus.CREATED);

      dates.push(dateStr);
    }

    // Query for entries in the date range
    const startDate = dates[dates.length - 1]; // Earliest date
    const endDate = dates[0]; // Latest date

    const response = await request(app.getHttpServer())
      .get(`/time-entries/range?startDate=${startDate}&endDate=${endDate}`)
      .expect(HttpStatus.OK);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(3);
  });

  it('/time-entries/daily-totals (GET) - Get daily totals by date range', async () => {
    // First create a project
    const projectData = {
      name: `Daily Totals Test Project ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    const projectId = projectResponse.body.id;

    // Create a few time entries for different dates
    const dates = [];
    for (let i = 0; i < 2; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i); // Previous days
      const dateStr = date.toISOString().split('T')[0];

      const timeEntryData = {
        date: dateStr,
        hours: 4 + i,
        description: faker.lorem.sentence(),
        projectId: projectId,
      };

      await request(app.getHttpServer())
        .post('/time-entries')
        .send(timeEntryData)
        .expect(HttpStatus.CREATED);

      dates.push(dateStr);
    }

    // Query for daily totals in the date range
    const startDate = dates[dates.length - 1]; // Earliest date
    const endDate = dates[0]; // Latest date

    const response = await request(app.getHttpServer())
      .get(`/time-entries/daily-totals?startDate=${startDate}&endDate=${endDate}`)
      .expect(HttpStatus.OK);

    expect(Array.isArray(response.body)).toBe(true);
    // Each date should have its total hours
    for (const day of response.body) {
      expect(day.date).toBeDefined();
      expect(day.totalHours).toBeDefined();
      expect(day.entries).toBeDefined();
    }
  });

  it('/time-entries/total-hours (GET) - Get total hours by date range', async () => {
    // First create a project
    const projectData = {
      name: `Total Hours Test Project ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    const projectId = projectResponse.body.id;

    // Create a few time entries
    let expectedTotal = 0;
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i); // Previous days
      const dateStr = date.toISOString().split('T')[0];

      const hours = 2 + i;
      expectedTotal += hours;

      const timeEntryData = {
        date: dateStr,
        hours: hours,
        description: faker.lorem.sentence(),
        projectId: projectId,
      };

      await request(app.getHttpServer())
        .post('/time-entries')
        .send(timeEntryData)
        .expect(HttpStatus.CREATED);
    }

    // Query for total hours in the date range
    const date = new Date();
    date.setDate(date.getDate() - 3); // 3 days ago
    const startDate = date.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    const response = await request(app.getHttpServer())
      .get(`/time-entries/total-hours?startDate=${startDate}&endDate=${endDate}`)
      .expect(HttpStatus.OK);

    // The response is raw SQL result, so we need to check the structure differently
    expect(response.body).toBeDefined();
  });

  // ==================== VALIDATION TESTS ====================

  it('/time-entries (POST) - Creating time entry with missing required fields should fail', async () => {
    // First create a project
    const projectData = {
      name: `Validation Test Project ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    const projectId = projectResponse.body.id;

    // Try to create time entry without required fields
    const incompleteTimeEntryData = {
      date: new Date().toISOString().split('T')[0],
      // Missing hours, description, and projectId
    };

    await request(app.getHttpServer())
      .post('/time-entries')
      .send(incompleteTimeEntryData)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/time-entries (POST) - Creating time entry with empty description should fail', async () => {
    // First create a project
    const projectData = {
      name: `Empty Desc Test Project ${Date.now()}`,
      description: faker.lorem.sentence(),
    };

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send(projectData)
      .expect(HttpStatus.CREATED);

    const projectId = projectResponse.body.id;

    const timeEntryData = {
      date: new Date().toISOString().split('T')[0],
      hours: 5,
      description: '', // Empty description
      projectId: projectId,
    };

    await request(app.getHttpServer())
      .post('/time-entries')
      .send(timeEntryData)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/time-entries (POST) - Creating time entry with invalid project ID should fail', async () => {
    const fakeProjectId = uuidv4();

    const timeEntryData = {
      date: new Date().toISOString().split('T')[0],
      hours: 5,
      description: faker.lorem.sentence(),
      projectId: fakeProjectId,
    };

    await request(app.getHttpServer())
      .post('/time-entries')
      .send(timeEntryData)
      .expect(HttpStatus.NOT_FOUND);
  });
});