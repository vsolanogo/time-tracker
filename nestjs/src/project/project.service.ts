import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(name: string, description?: string): Promise<Project> {
    const existingProject = await this.projectRepository.findOne({
      where: { name },
    });

    if (existingProject) {
      throw new BadRequestException('Project with this name already exists');
    }

    const project = this.projectRepository.create({ name, description });
    return await this.projectRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return await this.projectRepository.find();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
    });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    
    return project;
  }

  async update(id: string, name?: string, description?: string): Promise<Project> {
    const project = await this.findOne(id);

    if (name) {
      // Check if another project with the same name exists
      const existingProject = await this.projectRepository.findOne({
        where: { name },
      });

      if (existingProject && existingProject.id !== id) {
        throw new BadRequestException('Another project with this name already exists');
      }

      project.name = name;
    }

    if (description !== undefined) {
      project.description = description;
    }

    return await this.projectRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
  }
}