import { IsDate, IsNotEmpty } from 'class-validator';
import { StatusProjectEnum } from 'src/common/enum/enums';
import { CreateAssignDto } from 'src/modules/assign/dto/create-assign.dto';

export class CreateProjectDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  managerId: string;

  @IsNotEmpty()
  description: string;

  specification: string;
  status: StatusProjectEnum;

  langFrame: { name: string }[];
  technology: { name: string }[];

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;
  employee_project?: CreateAssignDto[];
}
