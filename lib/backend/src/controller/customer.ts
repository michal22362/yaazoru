import { Request, Response } from 'express';
import db from "../db"
import { Customer, sanitize } from "../model/Customer";

const createCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const customerData = req.body;
        const sanitized = sanitize(customerData, false);
        const customers: Customer[] = await db.Customer.getCustomers();

        const existingCustomer = customers?.find(customer => customer.email === sanitized.email || customer.id_number === sanitized.id_number);
        if (existingCustomer) {
            if (existingCustomer.email === sanitized.email) {
                throw {
                    status: 409,
                    message: 'Email already exists',
                };
            }
            if (existingCustomer.id_number === sanitized.id_number) {
                throw {
                    status: 409,
                    message: 'ID number already exists',
                };
            }
        }
        const customer = await db.Customer.createCustomer(sanitized);
        res.status(201).json(customer);
    } catch (error: any) {
        handleError(res, error);
    }
};

const getCustomers = async (req: Request, res: Response): Promise<void> => {
    try {
        const customers = await db.Customer.getCustomers();
        res.status(200).json(customers);
    } catch (error: any) {
        handleError(res, error)
    }
};

const getCustomerById = async (req: Request, res: Response): Promise<void> => {
    console.log('get by id');

    try {
        if (!req.params.id)
            throw {
                status: 400,
                message: 'No ID provided'
            };
        console.log(req.params.id);

        const customer = await db.Customer.getCustomerById(req.params.id);
        console.log(customer);

        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.status(200).json(customer);
    } catch (error: any) {
        handleError(res, error);
    }
};

const updateCustomer = async (req: Request, res: Response): Promise<void> => {
    console.log('i in update');
    
    try {
        console.log('update');
        
        if (!req.body)
            throw {
                status: 400,
                message: 'No body provaider'
            }
        const sanitized = sanitize(req.body, false);
        console.log('after sanitize');
        console.log(sanitize);
        
        
        await db.Customer.updateCustomer(req.params.id, sanitized);
        res.status(200).json({ message: 'Customer updated successfully.' });
    } catch (error: any) {
        handleError(res, error);
    }
};

const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.params.id)
            throw {
                status: 400,
                message: 'No ID provided'
            };
        await db.Customer.deleteCustomer(req.params.id);
        res.status(200).json({ message: 'Customer deleted successfully.' });
    } catch (error: any) {
        handleError(res, error);
    }
};

const handleError = (res: Response, error: any): void => {
    console.error('Error:', error.message);
    if (error.status) {
        res.status(error.status).json({ message: error.message });
    } else {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export {
    createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer,
}
