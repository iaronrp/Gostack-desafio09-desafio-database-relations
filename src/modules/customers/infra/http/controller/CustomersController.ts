import { Request, Response } from 'express';
import { container } from 'tsyringe';

import CreateCustomerService from '@modules/customers/services/CreateCustomerService';

export default class CustomersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { email, name } = request.body;
    const createUser = container.resolve(CreateCustomerService);

    const user = await createUser.execute({ name, email });

    return response.json(user);
  }
}
