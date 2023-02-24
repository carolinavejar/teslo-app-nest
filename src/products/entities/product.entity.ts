import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/auth/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./produc-image.entity";

@Entity({ name: 'products' })
export class Product {
    @ApiProperty({
        example: '1cbca961-2a0d-47c1-9be3-4c1c00716758',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-Shirt testlo',
        description: 'Product title',
        uniqueItems: true
    })
    @Column('text' , {
        unique: true
    })
    title: string;

    @ApiProperty({
        example: '100',
        description: 'Product proce',
    })
    @Column('float' , {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'Anim do Lorem voluptate sunt commodo elit.',
        description: 'Product description',
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 't-shirt_teslo',
        description: 'Product Slug',
        uniqueItems: true
    })
    @Column('text' , {
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: '5',
        description: 'Product stock',
        default: 0
    })
    @Column('numeric' , {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: '["L", "XL"]',
        description: 'Product sizes',
    })
    @Column('text' , {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'women',
        description: 'Product gender',
    })
    @Column('text')
    gender: string;

    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        {   
            cascade: true,
            eager: true
        }
    )
    images?: ProductImage[]

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User
    @BeforeInsert()
    checkSlugInsert() {
        if(!this.slug) {
            this.slug = this.title;
        }

        this.slug = this.slug
        .toLowerCase()
        .replaceAll(" ", "_")
        .replaceAll("'", "'")
    }

    @BeforeUpdate()
    checkSlugUpdate() {       
        this.slug = this.slug
        .toLowerCase()
        .replaceAll(" ", "_")
        .replaceAll("'", "'")
    }
  

}
