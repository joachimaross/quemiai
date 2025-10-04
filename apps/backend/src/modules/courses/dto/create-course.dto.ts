import { IsString, IsNumber, IsArray, Min } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  credits: number;

  @IsArray()
  @IsString({ each: true })
  prerequisites: string[];
}
