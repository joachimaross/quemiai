import { IsString, IsNumber, IsArray, IsOptional, Min } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  credits?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];
}
