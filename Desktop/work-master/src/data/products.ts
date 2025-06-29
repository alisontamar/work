import { Product } from '../types';

export const products: Product[] = [
    {
        id: '1',
        name: 'Laptop Lenovo ThinkPad',
        color: 'Negro',
        price: 1,
        stock_quantity: 10,
        barcode: '1234567890123',
        profit_bob: 10,
        cost_price: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        image_url: 'https://images.pexels.com/photos/18105/pexels-photo.jpg',
        mei_code1: 'MEI123456',
        mei_code2: 'MEI789012',
        store_id: '1'
    },
    {
        id: '2',
        name: 'iPhone 13 Pro',
        color: 'Azul',
        price: 1,
        stock_quantity: 15,
        barcode: '1234567890123',
        profit_bob: 10,
        cost_price: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        image_url: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
        mei_code1: 'MEI345678',
        mei_code2: 'MEI901234',
        store_id: '1'
    }
];