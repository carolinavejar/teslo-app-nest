import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(

    private readonly productsService: ProductsService,
    @InjectRepository( User)
    private readonly userReposity: Repository <User>
  ) {}
  async runSeed () {
    await this.deleteTables();
    const admUser = await this.insertUsers();
    console.log("insertNewProducts ...");
    await this.insertNewProducts(admUser);
    console.log("Seed Executed ...");
    return 'Seed Excecuted'
  }

  private async deleteTables() {
  await this.productsService.deleteAllProduct();
    const queryBuilder = this.userReposity.createQueryBuilder();
    await queryBuilder
    .delete()
    .where({})
    .execute;
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users : User[] = [];

    seedUsers.forEach(user=> {
      users.push(this.userReposity.create(user))
    })

    const usersDB = await this.userReposity.save(seedUsers)

    return usersDB[0];
  }

  private async insertNewProducts(user: User) {
    await this.productsService.deleteAllProduct();
    const seedProducts = initialData.products;

    const insertPromises = [];

    seedProducts.forEach(product => {
      insertPromises.push(this.productsService.create(product, user));
    });
    
    await Promise.all(insertPromises);
    return true
    
  }
}
