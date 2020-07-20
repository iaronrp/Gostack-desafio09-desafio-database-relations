import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found');
    }
    const findProducts = await this.productsRepository.findAllById(products);

    if (findProducts.length !== products.length) {
      throw new AppError('Product(s) not found');
    }

    const orderProducts = findProducts.map(product => {
      const quantity = products.find(p => p.id === product.id)?.quantity || 0;

      if (!quantity || quantity <= 0 || quantity > product.quantity) {
        throw new AppError('Quantity invalid');
      }

      return {
        product_id: product.id,
        price: product.price || 0,
        quantity: products.find(p => p.id === product.id)?.quantity || 0,
      };
    });

    const order = this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
