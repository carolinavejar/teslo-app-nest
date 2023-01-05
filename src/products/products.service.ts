import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID} from 'uuid';
import { query } from 'express';
import { ProductImage } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService')
  constructor(
    @InjectRepository(Product)
    private readonly productRepository : Repository<Product>,
  
    @InjectRepository(ProductImage)
    private readonly productImageRepository : Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async findOnePlain (term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map (img => img.url)

    }
  }
  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } =  createProductDto;
      const product  = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url :  image}))
      })
      await this.productRepository.save(product);
      return {...product, images}
    } catch (error) {
      this.handleExeptions(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset =  0 } = paginationDto;
     
      const products  = await this.productRepository.find({
        take: limit,
        skip: offset, 
        relations: {
          images: true
        }
      })
      
      return products.map ( product => ({
        ...product,
        images: product.images.map(img => img.url)
      }))
    } catch (error) {
      this.handleExeptions(error)
    };
  }

  async findOne(term: string) {
    let product : Product;
    if(isUUID(term))
      product = await this.productRepository.findOneBy({ id: term });
    else{
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      term = term.toLowerCase()
      product = await queryBuilder.where(`lower(title)=:title or lower(slug)=:slug`,
      {
        title: term,
        slug: term
      })
      .leftJoinAndSelect('prod.images', 'prodImages')
      .getOne();
    }
    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate} = updateProductDto;
    const product = await this.productRepository.preload({
      id,
      ... toUpdate,
      images: []
    });
    if (!product ){
      throw new NotFoundException (`Product with id ${ id } not found`);
    }
      
    // Query runner

    const queryRunner = this.dataSource.createQueryRunner();
    // if(images)
    try {
      return await this.productRepository.save(product)
    } catch (error) {
      this.handleExeptions(error)
    }
      
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
