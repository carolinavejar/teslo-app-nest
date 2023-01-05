import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID} from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService')
  constructor(
    @InjectRepository(Product)
    private readonly productRepository : Repository<Product>
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      // if(!createProductDto.slug) {
      //   createProductDto.slug = createProductDto.
      //   title.toLocaleLowerCase()
      //   .replaceAll(' ', '_')
      //   .replaceAll("'", '')
      // } else {
      //   createProductDto.slug = createProductDto.
      //   slug.toLocaleLowerCase()
      //   .replaceAll(' ', '_')
      //   .replaceAll("'", '')
      // }
      const product  = this.productRepository.create(createProductDto)
      await this.productRepository.save(product);
      return product
    } catch (error) {
      this.handleExeptions(error)
    }
  }

  findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset =  0 } = paginationDto;
      console.log("Limite _ ", limit);
      
      const products  = this.productRepository.find({
        take: limit,
        skip: offset
      });
      return products
    } catch (error) {
      this.handleExeptions(error)
    };
  }

  async findOne(term: string) {
    let product : Product;
    if(isUUID(term))
    product = await this.productRepository.findOneBy({ id: term });
    else
    product = await this.productRepository.findOneBy({ slug: term });
    return product
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    if (product) {
      await this.productRepository.delete( { id });
      return `Product ${id} deleted`
    } else {
      return `Product ${id} not found`
    }
  }

  private handleExeptions(error: any) {
    if(error.code === '23505')
      throw new InternalServerErrorException(error.detail)

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs')

  }
}
