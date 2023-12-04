/* eslint-disable prettier/prettier */
import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StatusProjectEnum } from 'src/common/enum/enums';
import { EmployeeProject } from './employee_project';

@Entity()
export class Project extends AbstractEntity{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('json', { nullable: true })
  metadata: Record<string, unknown>;

  @Column()
  name: string;

  @Column()
  manager: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  specification: string;

  @Column()
  langFrame: string;

  @Column()
  technology: string;

  @Column({ type: 'enum', enum: StatusProjectEnum, default: StatusProjectEnum.PENDING })
  status: StatusProjectEnum;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @OneToMany(
    () => EmployeeProject,
    (employee_project) => employee_project.project,
  )
  employee_project: EmployeeProject[];

  constructor(project: Partial<Project>){
    super();
    Object.assign(this, project);
  }
}