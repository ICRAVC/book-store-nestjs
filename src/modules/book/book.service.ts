import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { status } from '../../shared/entity-status.enum';
import { In } from 'typeorm';
import { Role } from '../role/role.entity';
import { RoleType } from '../role/roletype.enum';
import { User } from '../user/user.entity';
import { UserRepository } from '../user/user.repository';
import { Book } from './book.entity';
import { BookRepository } from './book.repository';
import { CreateBookDto, ReadBookDto, UpdateBookDto } from './dto';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(BookRepository)
    private readonly _bookRepository: BookRepository,
    @InjectRepository(UserRepository)
    private readonly _userRepository: UserRepository,
  ){}

  async get(bookId: number): Promise<ReadBookDto>{
    if(!bookId){
      throw new BadRequestException('El bookId debe ser enviado');
    }

    const book: Book = await this._bookRepository.findOne(bookId, {where: {status: status.ACTIVE}});

    if(!book){
      throw new NotFoundException('El libro no existe');
    }

    return plainToClass(ReadBookDto, book);
  }

  async getAll(): Promise<ReadBookDto[]>{
    const books: Book[] = await this._bookRepository.find({
      where:{status: status.ACTIVE}
    });

    return books.map(book => plainToClass(ReadBookDto, book));
  }

  async getBookByAuthor(authorId: number): Promise<ReadBookDto[]>{
    if(!authorId){
      throw new BadRequestException('El authorId debe ser enviado');
    }

    const books: Book[] = await this._bookRepository.find({
      where:{status: status.ACTIVE, authors: In([authorId])}
    });

    return books.map(book => plainToClass(ReadBookDto, book));
  }

  async create(book: Partial<CreateBookDto>): Promise<ReadBookDto>{
    const authors: User[] = [];

    for(const authorId of book.authors){
      const authorExist = await this._userRepository.findOne(authorId,{
        where:{status:status.ACTIVE}
      });

      if(!authorExist){
        throw new NotFoundException(`No existe autor con el id ${authorId}`);
      }

      const isAuthor = authorExist.roles.some(
        (role: Role) => role.name === RoleType.AUTHOR,
      );

      if(!isAuthor){
        throw new UnauthorizedException(`Este id de usuario ${authorId} no corresponde a un autor`);
      }

      authors.push(authorExist);
    }
    const savedBook: Book = await this._bookRepository.save({
      name: book.name,
      description: book.description,
      authors,
    });

    return plainToClass(ReadBookDto, savedBook);
  }

  async createByAuthor(book: Partial<CreateBookDto>, authorId: number){
    const author = await this._userRepository.findOne(authorId,{
      where: {status: status.ACTIVE},
    });

    const isAuthor = author.roles.some(
      (role: Role) => role.name === RoleType.AUTHOR,
    );

    if(!isAuthor){
      throw new UnauthorizedException(`Este id de usuario ${authorId} no corresponde a un autor`);
    }

    const savedBook: Book = await this._bookRepository.save({
      name: book.name,
      description: book.description,
      author,
    });

    return plainToClass(ReadBookDto, savedBook);
  }

  async update(bookId: number, book: Partial<UpdateBookDto>, authorId: number): Promise<ReadBookDto>{
    const bookExist = await this._bookRepository.findOne(bookId, {
      where : {status: status.ACTIVE},
    });

    if(!bookExist){
      throw new NotFoundException('El libro no existe');
    }

    const isOwnBook = bookExist.authors.some(author => author.id === authorId);

    if(!isOwnBook){
      throw new UnauthorizedException('Este usuario no es el autor del libro');
    }

    const updatedBook = await this._bookRepository.update(bookId, book);
    return plainToClass(ReadBookDto, updatedBook);
  }

  async delete(bookId: number): Promise <void>{
    const bookExist = await this._bookRepository.findOne(bookId, {
      where: {status: status.ACTIVE},
    });

    if(!bookExist){
      throw new NotFoundException('El libro no existe');
    }

    await this._bookRepository.update(bookId, {status: status.INACTIVE});
  }
}
