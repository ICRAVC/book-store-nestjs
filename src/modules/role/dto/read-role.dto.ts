import { Exclude, Expose } from "class-transformer";
import { IsNumber, IsString, MaxLength } from "class-validator";

@Exclude()
export class ReadRoleDto{
  @Expose()
  @IsNumber()
  readonly id: number;

  @Expose()
  @IsString()
  @MaxLength(50, {message: 'El nombre no es valido'})
  readonly name: string;

  @Expose()
  @IsString()
  @MaxLength(100, {message: 'La description no es valida'})
  readonly description: string;
}