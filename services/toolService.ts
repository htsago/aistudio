
import { type Product, type Order, type Cart, type Recommendation } from '../types';

const products: Product[] = [
    { id: "P001", name: "Wireless Headphones Pro", category: "electronics", price: 129.99, in_stock: true, rating: 4.5 },
    { id: "P002", name: "Running Shoes Ultra", category: "clothing", price: 89.99, in_stock: true, rating: 4.7 },
    { id: "P003", name: "Smart Watch Series 5", category: "electronics", price: 299.99, in_stock: false, rating: 4.3 },
    { id: "P004", name: "Coffee Maker Deluxe", category: "home", price: 79.99, in_stock: true, rating: 4.6 },
    { id: "P005", name: "Python Programming Book", category: "books", price: 45.00, in_stock: true, rating: 4.8 },
    { id: "P006", name: "Bluetooth Speaker", category: "electronics", price: 59.99, in_stock: true, rating: 4.4 },
    { id: "P007", name: "Yoga Mat Premium", category: "sports", price: 39.99, in_stock: true, rating: 4.6 },
];

// Mock context that would normally be managed per user session
let mockCart: Cart = {
    cart_id: "CART_CUST_12345_5678",
    customer_id: "CUST_12345",
    items: [],
    item_count: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
};

function recalculateCart() {
    const subtotal = mockCart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    mockCart.subtotal = parseFloat(subtotal.toFixed(2));
    mockCart.tax = parseFloat(tax.toFixed(2));
    mockCart.total = parseFloat((subtotal + tax).toFixed(2));
    mockCart.item_count = mockCart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export const search_products = async (args: { query: string; category?: string; max_results?: number }): Promise<Product[]> => {
    console.log("Searching for products with args:", args);
    const { query, category, max_results = 5 } = args;
    const queryLower = query.toLowerCase();
    
    let results = products.filter(
        p => p.name.toLowerCase().includes(queryLower) || p.category.toLowerCase().includes(queryLower)
    );

    if (category) {
        results = results.filter(p => p.category === category.toLowerCase());
    }
    
    return results.slice(0, max_results);
};

export const get_order_status = async (args: { order_id: string }): Promise<Order> => {
    console.log("Getting order status for:", args.order_id);
    const statuses = ["processing", "shipped", "in_transit", "out_for_delivery", "delivered"];
    const now = new Date();
    const orderDate = new Date(now.setDate(now.getDate() - Math.floor(Math.random() * 10) + 1));
    const deliveryDate = new Date(now.setDate(now.getDate() + Math.floor(Math.random() * 5) + 1));

    return {
        order_id: args.order_id,
        customer_id: "CUST_12345", // Mocked
        status: statuses[Math.floor(Math.random() * statuses.length)],
        order_date: orderDate.toISOString().split('T')[0],
        estimated_delivery: deliveryDate.toISOString().split('T')[0],
        total_amount: parseFloat((Math.random() * (500 - 50) + 50).toFixed(2)),
        tracking_number: `TRK${Math.floor(Math.random() * 900000) + 100000}`,
        items_count: Math.floor(Math.random() * 5) + 1,
    };
};

export const add_to_cart = async (args: { product_id: string; quantity?: number }): Promise<{ status: string, message: string, cart_total_items: number }> => {
    console.log("Adding to cart:", args);
    const { product_id, quantity = 1 } = args;
    const product = products.find(p => p.id === product_id);

    if (!product) {
        return { status: "error", message: `Product with ID ${product_id} not found.`, cart_total_items: mockCart.item_count };
    }
    
    const existingItem = mockCart.items.find(item => item.product_id === product_id);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        mockCart.items.push({ product_id: product.id, name: product.name, quantity: quantity, price: product.price });
    }

    recalculateCart();

    return {
        status: "success",
        message: `Added ${quantity} x ${product.name} to cart.`,
        cart_total_items: mockCart.item_count
    };
};

export const get_cart_contents = async (): Promise<Cart> => {
    console.log("Getting cart contents");
    return { ...mockCart };
};

export const apply_discount_code = async (args: { code: string }): Promise<{ valid: boolean; message: string; code: string; }> => {
    console.log("Applying discount code:", args.code);
    const valid_codes: { [key: string]: any } = {
        "WELCOME10": { type: "percentage", value: 10 },
        "SAVE20": { type: "percentage", value: 20 },
        "FREESHIP": { type: "free_shipping", value: 0 },
    };
    const codeUpper = args.code.toUpperCase();
    if (valid_codes[codeUpper]) {
        return { valid: true, code: codeUpper, message: `Discount code '${codeUpper}' applied successfully!` };
    }
    return { valid: false, code: args.code, message: "Invalid discount code." };
};

export const get_product_recommendations = async (): Promise<Recommendation[]> => {
    console.log("Getting product recommendations");
     const recs: Recommendation[] = [
        { id: "P101", name: "Laptop Stand Premium", price: 49.99, reason: "Frequently bought together" },
        { id: "P102", name: "Ergonomic Mouse", price: 34.99, reason: "Customers also viewed" },
        { id: "P103", name: "USB-C Hub", price: 29.99, reason: "Based on your browsing history" },
        { id: "P104", name: "Monitor Light Bar", price: 89.99, reason: "Trending in electronics" },
    ];
    // return 3 random recommendations
    return recs.sort(() => 0.5 - Math.random()).slice(0, 3);
};

export const toolMapping: { [key: string]: Function } = {
    search_products,
    get_order_status,
    add_to_cart,
    get_cart_contents,
    apply_discount_code,
    get_product_recommendations
};
