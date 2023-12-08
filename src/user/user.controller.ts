import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({
    status: 200,
    description: 'User found.',
    type: CreateUserDto,
  })
  async getUserById(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted.',
    type: CreateUserDto,
  })
  async deleteUser(@Param('id') id: number) {
    return this.userService.deleteUser(id);
  }
}
