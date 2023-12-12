import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { EntityManager, Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GetProjectParams } from './dto/getList-project.dto';
import { Order, StatusProjectEnum } from 'src/common/enum/enums';
import { PageMetaDto } from 'src/common/dtos/pageMeta';
import { ResponsePaginate } from 'src/common/dtos/responsePaginate';
import { Employee } from 'src/entities/employee.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRespository: Repository<Project>,
    @InjectRepository(Employee)
    private employeeRespository: Repository<Employee>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const project = new Project(createProjectDto);
    await this.entityManager.save(project);
    return { project, message: 'Successfully create projects' };
  }

  async getProjects(params: GetProjectParams) {
    const projects = this.projectRespository
      .createQueryBuilder('project')
      .select([
        'project',
        'manager.code',
        'manager.name',
        'manager.avatar',
        'manager.email',
        'employee_project',
        'employee_project.role',
        'employee_project.joinDate',
        'employee_project.fireDate',
        'employee_project.employeeId',
        'employee.name',
        'employee.email',
        'employee.code',
        'employee.avatar',
      ])
      .leftJoin('project.managerProject', 'manager')
      .leftJoin('project.employee_project', 'employee_project')
      .leftJoin('employee_project.employee', 'employee')
      .andWhere('project.status = ANY(:status)', {
        status: params.status
          ? [params.status]
          : [
              StatusProjectEnum.DONE,
              StatusProjectEnum.ON_PROGRESS,
              StatusProjectEnum.PENDING,
              StatusProjectEnum.CLOSED,
            ],
      })
      .skip(params.skip)
      .take(params.take)
      .orderBy('project.createdAt', Order.DESC);

    if (params.search) {
      projects.andWhere('project.name ILIKE :name', {
        name: `%${params.search}%`,
      });
    }
    const [result, total] = await projects.getManyAndCount();
    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: params,
    });
    return new ResponsePaginate(result, pageMetaDto, 'Successfully');
  }

  async getProjectById(id: string) {
    const employee = await this.projectRespository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.managerProject', 'manager')
      .leftJoinAndSelect('project.employee_project', 'employee_project')
      .leftJoinAndSelect('employee_project.employee', 'employee')
      .where('project.id = :id', { id })
      .getOne();
    return employee;
  }
  async getUnassignedEmployeesInProject(id: string) {
    const project = await this.projectRespository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.employee_project', 'employee_project')
      .leftJoinAndSelect('employee_project.employee', 'employee')
      .where('project.id = :id', { id })
      .getOne();

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const allEmployees = await this.employeeRespository.find();
    const unassignedEmployees = allEmployees.filter((employee) => {
      return !project.employee_project.some(
        (assignedEmployee) => assignedEmployee.employeeId === employee.id,
      );
    });
    return unassignedEmployees;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.projectRespository.findOneBy({ id });
    project.name = updateProjectDto.name;
    project.managerId = updateProjectDto.managerId;
    project.description = updateProjectDto.description;
    project.specification = updateProjectDto.specification;
    project.status = updateProjectDto.status;
    project.langFrame = updateProjectDto.langFrame;
    project.technology = updateProjectDto.technology;
    project.startDate = updateProjectDto.startDate;
    project.endDate = updateProjectDto.endDate;
    await this.entityManager.save(project);
    return { project, message: 'Successfully update project' };
  }

  async remove(id: string) {
    await this.projectRespository.softDelete(id);
    return { message: 'Project deletion successful' };
  }
}
