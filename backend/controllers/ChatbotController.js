import Product from '../models/product_model.js';
import Order from '../models/order_model.js';
import Category from '../models/category_model.js';
import { generateInvoiceContent, sendEmail } from '../utils/invoice_utils.js';

const ChatbotController = {
    handleWebhook: async (req, res) => {
        try {
            const intentName = req.body.queryResult.intent.displayName;
            const parameters = req.body.queryResult.parameters;

            console.log(`Intent detected: ${intentName}`);
            console.log('Parameters:', parameters);

            // Khởi tạo session nếu chưa có
            req.session = req.session || {};

            switch (intentName) {
                case 'Default Welcome Intent':
                    return handleWelcome(req, res);
                case 'product_consulting':
                    return await handleProductConsultation(parameters, req, res);
                case 'product_by_category':
                    return await handleProductByCategory(parameters, req, res);
                case 'product_by_price':
                    return await handleProductByPrice(parameters, req, res);
                case 'product_by_brand':
                    return await handleProductByBrand(parameters, req, res);
                case 'select_product':
                    return await handleProductSelection(parameters, req, res);
                case 'select_filtered_product':
                    return await handleFilteredProductSelection(parameters, req, res);
                case 'select_product_size':
                    return await handleProductSize(parameters, req, res);
                case 'select_product_color':
                    return await handleProductColor(parameters, req, res);
                case 'select_product_quantity':
                    return await handleProductQuantity(parameters, req, res);
                case 'collect_delivery_information':
                    return await handleDeliveryInformation(parameters, req, res);
                case 'select_payment_method':
                    return await handlePaymentMethod(parameters, req, res);
                case 'confirm_order':
                    return await handleOrderConfirmation(parameters, req, res);
                case 'provide_late_email':
                    return await handleLateEmail(parameters, req, res);
                default:
                    return handleDefaultResponse(req, res);
            }
        } catch (error) {
            console.error('Webhook error:', error);
            return handleError(res);
        }
    }
};

// Xử lý chào mừng
function handleWelcome(req, res) {
    return res.json({
        fulfillmentText:
            'Xin chào! Tôi là trợ lý ảo của cửa hàng giày.\n' +
            'Tôi có thể giúp bạn:\n' +
            '1. Tư vấn sản phẩm\n' +
            '2. Tìm giày theo danh mục\n' +
            '3. Tìm giày theo giá\n' +
            '4. Tìm giày theo thương hiệu\n' +
            'Bạn cần giúp đỡ gì ạ?'
    });
}

// Xử lý tư vấn sản phẩm
async function handleProductConsultation(parameters, req, res) {
    const { category, price, discount, brand, style, purpose } = parameters;

    console.log('Product consulting parameters:', { category, price, discount, brand, style, purpose });

    let query = {};
    let suggestions = [];

    if (brand) {
        query.brand = { $regex: brand, $options: 'i' };
        suggestions.push(`thương hiệu ${brand}`);
    }

    if (category) {
        const categoryExists = await Category.findOne({ name: { $regex: category, $options: 'i' } });
        if (!categoryExists) {
            const categories = await Category.find({}, 'name');
            const categoryList = categories.map(c => c.name).join(', ');
            return res.json({
                fulfillmentText: `Danh mục "${category}" không tồn tại. Vui lòng chọn một trong các danh mục sau: ${categoryList}`
            });
        }
        query.category = categoryExists._id;
        suggestions.push(`danh mục ${categoryExists.name}`);
    }

    if (price) {
        const priceRange = await handlePriceRange(price);
        if (priceRange.error) {
            return res.json({ fulfillmentText: priceRange.error });
        }
        query.price = priceRange.query;
        suggestions.push(priceRange.description);
    }

    if (discount) {
        if (['có', 'yes', 'đang sale'].includes(discount.toLowerCase())) {
            query.discount = { $exists: true, $ne: null };
            suggestions.push('đang giảm giá');
        }
    }

    if (purpose) {
        const purposeKeywords = {
            'chạy bộ': ['Running', 'chạy bộ', 'thể thao'],
            'đi chơi': ['Casual', 'đi chơi', 'thời trang'],
            'đi làm': ['Formal', 'công sở', 'lịch sự']
        };

        const keywords = purposeKeywords[purpose.toLowerCase()] || [];
        if (keywords.length > 0) {
            query.$or = [
                { 'category.name': { $in: keywords.map(k => new RegExp(k, 'i')) } },
                { description: { $in: keywords.map(k => new RegExp(k, 'i')) } }
            ];
            suggestions.push(`phù hợp để ${purpose}`);
        }
    }

    console.log('Final query:', JSON.stringify(query, null, 2));

    const products = await Product.find(query)
        .populate('category')
        .populate('discount')
        .limit(5);

    if (products.length > 0) {
        const outputContexts = [{
            name: `${req.body.session}/contexts/product_list_context`,
            lifespanCount: 5,
            parameters: {
                products: products,
                searchCriteria: suggestions.join(', ')
            }
        }];

        const productList = products.map((p, index) => {
            const discountedPrice = p.discount
                ? p.price * (1 - p.discount.amount / 100)
                : p.price;
            return `${index + 1}. ${p.name}\n` +
                `   💰 Giá: ${p.price.toLocaleString('vi-VN')} VND\n` +
                (p.discount ? `   🏷️ Giảm giá: ${p.discount.amount}% còn ${discountedPrice.toLocaleString('vi-VN')} VND\n` : '') +
                `   📏 Size: ${p.sizes.join(', ')}\n` +
                `   🎨 Màu sắc: ${p.colors.join(', ')}`;
        }).join('\n\n');

        const searchCriteria = suggestions.length > 0
            ? `\nTìm theo: ${suggestions.join(', ')}`
            : '';

        return res.json({
            fulfillmentText:
                `Tôi đã tìm thấy ${products.length} sản phẩm phù hợp:${searchCriteria}\n\n${productList}\n\n` +
                `Bạn muốn xem chi tiết sản phẩm nào? Hãy nói "chọn số [1-${products.length}]" hoặc "chọn [tên sản phẩm]"`,
            outputContexts: outputContexts
        });
    }

    return res.json({
        fulfillmentText:
            'Xin lỗi, tôi không tìm thấy sản phẩm nào phù hợp với yêu cầu của bạn.\n' +
            'Bạn có thể thử:\n' +
            '1. Tìm với tiêu chí khác\n' +
            '2. Xem tất cả sản phẩm trong danh mục\n' +
            '3. Điều chỉnh khoảng giá\n' +
            'Bạn muốn thử cách nào?'
    });
}

// Xử lý tìm sản phẩm theo danh mục
async function handleProductByCategory(parameters, req, res) {
    const { category } = parameters;

    try {
        const categoryDoc = await Category.findOne({ name: { $regex: category, $options: 'i' } });

        if (!categoryDoc) {
            const categories = await Category.find({}, 'name');
            const categoryList = categories.map(c => c.name).join(', ');
            return res.json({
                fulfillmentText: `Danh mục "${category}" không tồn tại. Vui lòng chọn một trong các danh mục sau: ${categoryList}`
            });
        }

        const products = await Product.find({ category: categoryDoc._id })
            .populate('category')
            .populate('discount')
            .limit(5);

        if (products.length > 0) {
            const productList = products.map((p, index) => {
                const discountedPrice = p.discount
                    ? p.price * (1 - p.discount.amount / 100)
                    : p.price;
                return `${index + 1}. ${p.name}\n` +
                    `   💰 Giá: ${p.price.toLocaleString('vi-VN')} VND\n` +
                    (p.discount ? `   🏷️ Giảm giá: ${p.discount.amount}% còn ${discountedPrice.toLocaleString('vi-VN')} VND\n` : '') +
                    `   📏 Size: ${p.sizes.join(', ')}\n` +
                    `   🎨 Màu sắc: ${p.colors.join(', ')}`;
            }).join('\n\n');

            const outputContexts = [{
                name: `${req.body.session}/contexts/product_list_context`,
                lifespanCount: 5,
                parameters: {
                    products: products,
                    searchCriteria: `danh mục ${categoryDoc.name}`
                }
            }];

            return res.json({
                fulfillmentText:
                    `Tôi đã tìm thấy ${products.length} sản phẩm trong danh mục ${categoryDoc.name}:\n\n${productList}\n\n` +
                    `Bạn muốn xem chi tiết sản phẩm nào? Hãy nói "chọn số [1-${products.length}]" hoặc "chọn [tên sản phẩm]"`,
                outputContexts: outputContexts
            });
        }

        return res.json({
            fulfillmentText: `Không có sản phẩm nào trong danh mục ${categoryDoc.name}. Bạn có muốn xem các danh mục khác không?`
        });

    } catch (error) {
        console.error('Category search error:', error);
        return res.json({
            fulfillmentText: 'Xin lỗi, đã có lỗi xảy ra khi tìm kiếm sản phẩm theo danh mục. Vui lòng thử lại sau.'
        });
    }
}

// Xử lý tìm sản phẩm theo giá
async function handleProductByPrice(parameters, req, res) {
    try {
        const { number, price_range, unit } = parameters;

        console.log('Price parameters:', { number, price_range, unit });

        if (parameters.price) {
            const priceRange = await handlePriceRange(parameters.price);
            if (priceRange.error) {
                return res.json({ fulfillmentText: priceRange.error });
            }

            const products = await Product.find({ price: priceRange.query })
                .populate('category')
                .populate('discount')
                .limit(5);

            return handleProductResults(products, priceRange.description, req, res);
        }

        if (number && price_range) {
            const numValue = Array.isArray(number) ? number[0] : number;
            const rangeType = Array.isArray(price_range) ? price_range[0] : price_range;
            const unitValue = Array.isArray(unit) ? unit[0] : unit;

            if (!numValue) {
                return res.json({ fulfillmentText: 'Vui lòng cung cấp giá cụ thể.' });
            }

            let query = {};
            let description = '';
            let value = parseFloat(numValue);

            let multiplier = 1;
            if (unitValue) {
                switch (unitValue.toLowerCase()) {
                    case 'triệu':
                    case 'tr':
                        multiplier = 1000000;
                        break;
                    case 'k':
                    case 'nghìn':
                        multiplier = 1000;
                        break;
                }
            }

            value = value * multiplier;

            if (rangeType === 'under_price') {
                query = { price: { $lte: value } };
                description = `dưới ${numValue} ${unitValue || 'VND'}`;
            } else if (rangeType === 'above_price') {
                query = { price: { $gte: value } };
                description = `trên ${numValue} ${unitValue || 'VND'}`;
            } else if (rangeType === 'between_price' && Array.isArray(number) && number.length >= 2) {
                const value2 = parseFloat(number[1]) * multiplier;
                query = { price: { $gte: value, $lte: value2 } };
                description = `từ ${number[0]} đến ${number[1]} ${unitValue || 'VND'}`;
            } else {
                query = { price: value };
                description = `${numValue} ${unitValue || 'VND'}`;
            }

            console.log('Price query:', query);

            const products = await Product.find(query)
                .populate('category')
                .populate('discount')
                .limit(5);

            return handleProductResults(products, description, req, res);
        }

        return res.json({
            fulfillmentText: 'Vui lòng cung cấp thông tin giá cụ thể để tìm kiếm sản phẩm. Ví dụ: "dưới 2 triệu", "từ 500k đến 1 triệu".'
        });
    } catch (error) {
        console.error('Price search error:', error);
        return handleError(res);
    }
}

// Xử lý khoảng giá
async function handlePriceRange(priceInput) {
    if (!priceInput) {
        return {
            error: 'Vui lòng cung cấp thông tin giá để tìm kiếm sản phẩm.'
        };
    }

    if (Array.isArray(priceInput)) {
        priceInput = priceInput[0].toString();
    } else if (typeof priceInput !== 'string') {
        priceInput = priceInput.toString();
    }

    const priceText = priceInput.toLowerCase();
    let query = {};
    let description = '';

    const patterns = {
        exact: /^giá\s*(\d+)\s*(triệu|tr|k|nghìn)?$/i,
        under: /^dưới\s*(\d+)\s*(triệu|tr|k|nghìn)?$/i,
        above: /^trên\s*(\d+)\s*(triệu|tr|k|nghìn)?$/i,
        between: /^từ\s*(\d+)\s*đến\s*(\d+)\s*(triệu|tr|k|nghìn)?$/i
    };

    const multipliers = {
        'triệu': 1000000,
        'tr': 1000000,
        'k': 1000,
        'nghìn': 1000
    };

    for (const [type, pattern] of Object.entries(patterns)) {
        const match = priceText.match(pattern);
        if (match) {
            const value1 = parseInt(match[1]);
            const unit = match[2]?.toLowerCase() || '';
            const multiplier = multipliers[unit] || 1;

            switch (type) {
                case 'exact':
                    query = { $eq: value1 * multiplier };
                    description = `giá ${value1} ${unit || 'VND'}`;
                    break;
                case 'under':
                    query = { $lte: value1 * multiplier };
                    description = `dưới ${value1} ${unit || 'VND'}`;
                    break;
                case 'above':
                    query = { $gte: value1 * multiplier };
                    description = `trên ${value1} ${unit || 'VND'}`;
                    break;
                case 'between':
                    const value2 = parseInt(match[2]);
                    query = {
                        $gte: value1 * multiplier,
                        $lte: value2 * multiplier
                    };
                    description = `từ ${value1} đến ${value2} ${unit || 'VND'}`;
                    break;
            }
            break;
        }
    }

    if (Object.keys(query).length === 0) {
        return {
            error: 'Xin lỗi, tôi không hiểu khoảng giá bạn muốn. Vui lòng thử lại với các cách nói như:\n' +
                '- "giá 2 triệu"\n' +
                '- "dưới 1 triệu"\n' +
                '- "trên 500k"\n' +
                '- "từ 1 đến 3 triệu"'
        };
    }

    return { query, description };
}

// Xử lý chọn sản phẩm - Cải tiến để hỗ trợ chọn nhiều sản phẩm và nhận diện đầu vào đơn giản
async function handleProductSelection(parameters, req, res) {
    const { product_name, product_number } = parameters;
    const rawInput = req.body.queryResult.queryText;

    console.log('Product selection parameters:', { product_name, product_number });
    console.log('Raw input:', rawInput);
    console.log('Output contexts:', req.body.queryResult.outputContexts);

    const productListContext = req.body.queryResult.outputContexts.find(
        context => context.name.includes('product_list_context')
    );

    if (!productListContext) {
        return res.json({
            fulfillmentText: 'Không tìm thấy danh sách sản phẩm. Vui lòng tìm kiếm sản phẩm trước.'
        });
    }

    let products = productListContext.parameters.products || [];

    if (products.length === 0) {
        return res.json({
            fulfillmentText: 'Danh sách sản phẩm trống. Vui lòng tìm kiếm sản phẩm trước.'
        });
    }

    // Mảng chứa các sản phẩm đã chọn
    let selectedProducts = [];

    // Pattern để nhận dạng các số trong chuỗi đầu vào
    // Có thể phát hiện "chọn 1, 2, 3" hoặc "1 2 3" hoặc "1,2,3" hoặc "1 và 2" hoặc đơn giản là "1" 
    const numberPattern = /\b(\d+)\b/g;
    const numbers = rawInput.match(numberPattern);

    // Kiểm tra nếu đầu vào chỉ là số đơn (ví dụ: "1", "2", v.v.)
    if (!product_name && !product_number && numbers && numbers.length > 0) {
        for (const num of numbers) {
            const index = parseInt(num) - 1;
            if (index >= 0 && index < products.length) {
                selectedProducts.push(products[index]);
            }
        }
    }
    // Kiểm tra xem có tên sản phẩm không
    else if (product_name) {
        // Tách tên sản phẩm nếu có nhiều tên được phân cách bởi dấu phẩy hoặc "và"
        const productNames = product_name.split(/,|\s+và\s+|\s+or\s+/).map(name => name.trim());

        for (const name of productNames) {
            const matchedProduct = products.find(p =>
                p.name && p.name.toLowerCase().includes(name.toLowerCase())
            );
            if (matchedProduct) {
                selectedProducts.push(matchedProduct);
            }
        }
    }
    // Xử lý khi có product_number (số thứ tự)
    else if (product_number) {
        if (Array.isArray(product_number)) {
            // Đã xử lý nhiều số trong mảng parameters
            for (const num of product_number) {
                const index = parseInt(num) - 1;
                if (index >= 0 && index < products.length) {
                    selectedProducts.push(products[index]);
                }
            }
        } else {
            // Chỉ có một số 
            const index = parseInt(product_number) - 1;
            if (index >= 0 && index < products.length) {
                selectedProducts.push(products[index]);
            }
        }
    }

    // Nếu không tìm thấy sản phẩm nào
    if (selectedProducts.length === 0) {
        return res.json({
            fulfillmentText: `Không tìm thấy sản phẩm bạn chọn. Vui lòng thử lại với số thứ tự từ 1-${products.length} hoặc tên sản phẩm.`
        });
    }

    // Nếu chỉ chọn 1 sản phẩm, xử lý như trước
    if (selectedProducts.length === 1) {
        const product = selectedProducts[0];
        const formattedPrice = product.price ? product.price.toLocaleString('vi-VN') : 'Chưa cập nhật';
        const discountedPrice = product.discount && product.price
            ? (product.price * (1 - product.discount.amount / 100)).toLocaleString('vi-VN')
            : null;

        const productDetails = [
            `🏷️ Tên sản phẩm: ${product.name || 'Chưa cập nhật'}`,
            `💰 Giá: ${formattedPrice} VND`,
            product.discount ? `🏷️ Giảm giá: ${product.discount.amount}%` : '',
            product.discount ? `💵 Giá sau giảm: ${discountedPrice} VND` : '',
            `👟 Thương hiệu: ${product.brand || 'Chưa cập nhật'}`,
            `📏 Kích thước có sẵn: ${product.sizes?.join(', ') || 'Chưa cập nhật'}`,
            `🎨 Màu sắc có sẵn: ${product.colors?.join(', ') || 'Chưa cập nhật'}`,
            `📦 Số lượng trong kho: ${product.stockQuantity || 0}`,
            `🏷️ Danh mục: ${product.category?.name || 'Chưa phân loại'}`,
            `🛠️ Chất liệu: ${product.material || 'Chưa cập nhật'}`
        ].filter(Boolean).join('\n');

        req.session.selectedProduct = {
            id: product._id,
            name: product.name,
            price: product.price,
            availableSizes: product.sizes || [],
            availableColors: product.colors || [],
            discount: product.discount,
            stockQuantity: product.stockQuantity
        };

        const outputContexts = [{
            name: `${req.body.session}/contexts/selected_product_context`,
            lifespanCount: 5,
            parameters: {
                selectedProduct: req.session.selectedProduct
            }
        }];

        return res.json({
            fulfillmentText: `${productDetails}\n\n👉 Vui lòng cho tôi biết:\n- Kích thước bạn muốn chọn\n- Số lượng bạn muốn mua\n- Màu sắc bạn thích\n\nVí dụ: "Size 41, số lượng 2, màu xanh"`,
            outputContexts: outputContexts
        });
    }
    // Nếu chọn nhiều sản phẩm, hiển thị danh sách và yêu cầu chọn 1
    else {
        // Hiển thị danh sách các sản phẩm đã chọn
        const selectedProductList = selectedProducts.map((p, index) => {
            const discountedPrice = p.discount
                ? p.price * (1 - p.discount.amount / 100)
                : p.price;
            return `${index + 1}. ${p.name}\n` +
                `   💰 Giá: ${p.price.toLocaleString('vi-VN')} VND\n` +
                (p.discount ? `   🏷️ Giảm giá: ${p.discount.amount}% còn ${discountedPrice.toLocaleString('vi-VN')} VND\n` : '');
        }).join('\n\n');

        // Lưu danh sách sản phẩm đã lọc vào context mới
        const outputContexts = [{
            name: `${req.body.session}/contexts/filtered_products_context`,
            lifespanCount: 5,
            parameters: {
                filteredProducts: selectedProducts
            }
        }];

        return res.json({
            fulfillmentText:
                `Bạn đã chọn ${selectedProducts.length} sản phẩm:\n\n${selectedProductList}\n\n` +
                `Vui lòng chọn một sản phẩm để xem chi tiết và tiếp tục. Hãy nói "Xem chi tiết sản phẩm số [1-${selectedProducts.length}]"`,
            outputContexts: outputContexts
        });
    }
}

// Thêm hàm mới để xử lý việc chọn từ danh sách đã lọc
async function handleFilteredProductSelection(parameters, req, res) {
    const { product_number } = parameters;
    const rawInput = req.body.queryResult.queryText;

    console.log('Filtered product selection parameters:', { product_number });
    console.log('Raw input:', rawInput);

    // Lấy danh sách sản phẩm đã lọc từ context
    const filteredProductsContext = req.body.queryResult.outputContexts.find(
        context => context.name.includes('filtered_products_context')
    );

    if (!filteredProductsContext || !filteredProductsContext.parameters.filteredProducts) {
        return res.json({
            fulfillmentText: 'Không tìm thấy danh sách sản phẩm đã lọc. Vui lòng tìm kiếm sản phẩm lại.'
        });
    }

    const filteredProducts = filteredProductsContext.parameters.filteredProducts;

    // Pattern để nhận dạng số từ chuỗi đầu vào
    const numberPattern = /\b(\d+)\b/g;
    const numbers = rawInput.match(numberPattern);

    let index = -1;

    // Ưu tiên lấy từ tham số product_number
    if (product_number) {
        index = parseInt(product_number) - 1;
    }
    // Sau đó thử nhận dạng số từ chuỗi đầu vào
    else if (numbers && numbers.length > 0) {
        index = parseInt(numbers[0]) - 1;
    }

    if (index < 0 || index >= filteredProducts.length) {
        return res.json({
            fulfillmentText: `Số thứ tự không hợp lệ. Vui lòng chọn số từ 1 đến ${filteredProducts.length}.`
        });
    }

    // Lấy thông tin sản phẩm đã chọn
    const product = filteredProducts[index];

    const formattedPrice = product.price ? product.price.toLocaleString('vi-VN') : 'Chưa cập nhật';
    const discountedPrice = product.discount && product.price
        ? (product.price * (1 - product.discount.amount / 100)).toLocaleString('vi-VN')
        : null;

    const productDetails = [
        `🏷️ Tên sản phẩm: ${product.name || 'Chưa cập nhật'}`,
        `💰 Giá: ${formattedPrice} VND`,
        product.discount ? `🏷️ Giảm giá: ${product.discount.amount}%` : '',
        product.discount ? `💵 Giá sau giảm: ${discountedPrice} VND` : '',
        `👟 Thương hiệu: ${product.brand || 'Chưa cập nhật'}`,
        `📏 Kích thước có sẵn: ${product.sizes?.join(', ') || 'Chưa cập nhật'}`,
        `🎨 Màu sắc có sẵn: ${product.colors?.join(', ') || 'Chưa cập nhật'}`,
        `📦 Số lượng trong kho: ${product.stockQuantity || 0}`,
        `🏷️ Danh mục: ${product.category?.name || 'Chưa phân loại'}`,
        `🛠️ Chất liệu: ${product.material || 'Chưa cập nhật'}`
    ].filter(Boolean).join('\n');

    req.session.selectedProduct = {
        id: product._id,
        name: product.name,
        price: product.price,
        availableSizes: product.sizes || [],
        availableColors: product.colors || [],
        discount: product.discount,
        stockQuantity: product.stockQuantity
    };

    const outputContexts = [{
        name: `${req.body.session}/contexts/selected_product_context`,
        lifespanCount: 5,
        parameters: {
            selectedProduct: req.session.selectedProduct
        }
    }];

    return res.json({
        fulfillmentText: `${productDetails}\n\n👉 Vui lòng cho tôi biết:\n- Kích thước bạn muốn chọn\n- Số lượng bạn muốn mua\n- Màu sắc bạn thích\n\nVí dụ: "Size 41, số lượng 2, màu xanh"`,
        outputContexts: outputContexts
    });
}

// Xử lý chọn kích thước
async function handleProductSize(parameters, req, res) {
    const { size } = parameters;
    const selectedProductContext = req.body.queryResult.outputContexts.find(
        context => context.name.endsWith('selected_product_context')
    );

    if (!selectedProductContext || !selectedProductContext.parameters.selectedProduct) {
        return res.json({
            fulfillmentText: 'Bạn chưa chọn sản phẩm nào. Vui lòng chọn sản phẩm trước.'
        });
    }

    const product = selectedProductContext.parameters.selectedProduct;
    if (!product.availableSizes.includes(parseInt(size))) {
        return res.json({
            fulfillmentText: `Size ${size} không có sẵn. Các size hiện có: ${product.availableSizes.join(', ')}`
        });
    }

    const outputContexts = [{
        name: `${req.body.session}/contexts/product_size_context`,
        lifespanCount: 5,
        parameters: {
            selectedSize: parseInt(size)
        }
    }];

    return res.json({
        fulfillmentText: `Đã chọn size ${size}. Vui lòng chọn màu sắc.`,
        outputContexts: outputContexts
    });
}

// Xử lý chọn màu sắc
async function handleProductColor(parameters, req, res) {
    const { color } = parameters;
    const selectedProductContext = req.body.queryResult.outputContexts.find(
        context => context.name.endsWith('selected_product_context')
    );

    if (!selectedProductContext || !selectedProductContext.parameters.selectedProduct) {
        return res.json({
            fulfillmentText: 'Bạn chưa chọn sản phẩm nào. Vui lòng chọn sản phẩm trước.'
        });
    }

    const product = selectedProductContext.parameters.selectedProduct;
    if (!product.availableColors.includes(color)) {
        return res.json({
            fulfillmentText: `Màu ${color} không có sẵn. Các màu hiện có: ${product.availableColors.join(', ')}`
        });
    }

    const outputContexts = [{
        name: `${req.body.session}/contexts/product_color_context`,
        lifespanCount: 5,
        parameters: {
            selectedColor: color
        }
    }];

    return res.json({
        fulfillmentText: `Đã chọn màu ${color}. Vui lòng chọn số lượng.`,
        outputContexts: outputContexts
    });
}

// Xử lý chọn số lượng
async function handleProductQuantity(parameters, req, res) {
    const { quantity } = parameters;
    const selectedProductContext = req.body.queryResult.outputContexts.find(
        context => context.name.endsWith('selected_product_context')
    );

    if (!selectedProductContext || !selectedProductContext.parameters.selectedProduct) {
        return res.json({
            fulfillmentText: 'Bạn chưa chọn sản phẩm nào. Vui lòng chọn sản phẩm trước.'
        });
    }

    const product = selectedProductContext.parameters.selectedProduct;
    const parsedQuantity = parseInt(quantity);

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return res.json({
            fulfillmentText: 'Số lượng không hợp lệ. Vui lòng nhập số lượng lớn hơn 0.'
        });
    }

    if (parsedQuantity > product.stockQuantity) {
        return res.json({
            fulfillmentText: `Xin lỗi, hiện chỉ còn ${product.stockQuantity} sản phẩm trong kho.`
        });
    }

    const outputContexts = [{
        name: `${req.body.session}/contexts/product_quantity_context`,
        lifespanCount: 5,
        parameters: {
            selectedQuantity: parsedQuantity
        }
    }];

    return res.json({
        fulfillmentText: `Đã chọn số lượng ${parsedQuantity}. Vui lòng cung cấp thông tin giao hàng.`,
        outputContexts: outputContexts
    });
}

// Xử lý thông tin giao hàng
async function handleDeliveryInformation(parameters, req, res) {
    const { shippingAddress, phone, email, recipientName } = parameters;

    console.log('Delivery information parameters:', { shippingAddress, phone, email, recipientName });
    console.log('Current session:', req.session);

    const contexts = req.body.queryResult.outputContexts || [];
    const selectedProductContext = contexts.find(ctx => ctx.name.includes('selected_product_context'));
    const productSizeContext = contexts.find(ctx => ctx.name.includes('product_size_context'));
    const productColorContext = contexts.find(ctx => ctx.name.includes('product_color_context'));
    const productQuantityContext = contexts.find(ctx => ctx.name.includes('product_quantity_context'));
    const deliveryInfoContext = contexts.find(ctx => ctx.name.includes('delivery_info_context'));

    if (!req.session.order) {
        req.session.order = {};
    }

    if (deliveryInfoContext && deliveryInfoContext.parameters.order) {
        req.session.order = { ...deliveryInfoContext.parameters.order };
    }

    if (selectedProductContext && selectedProductContext.parameters.selectedProduct) {
        const product = selectedProductContext.parameters.selectedProduct;
        req.session.order.product = product.id;
        req.session.order.productName = product.name;
        req.session.order.price = product.price;
    }

    if (productSizeContext && productSizeContext.parameters.selectedSize) {
        req.session.order.size = productSizeContext.parameters.selectedSize;
    }

    if (productColorContext && productColorContext.parameters.selectedColor) {
        req.session.order.color = productColorContext.parameters.selectedColor;
    }

    if (productQuantityContext && productQuantityContext.parameters.selectedQuantity) {
        req.session.order.quantity = productQuantityContext.parameters.selectedQuantity;
    }

    if (shippingAddress) {
        req.session.order.shippingAddress = shippingAddress;
    } else {
        const rawInput = req.body.queryResult.queryText;
        if (rawInput && rawInput.toLowerCase().includes('địa chỉ')) {
            const addressMatch = rawInput.match(/địa chỉ[:\s]+(.+)/i);
            if (addressMatch && addressMatch[1]) {
                req.session.order.shippingAddress = addressMatch[1].trim();
            }
        }
    }

    if (phone && phone.length > 0) {
        req.session.order.phone = Array.isArray(phone) ? phone[0] : phone;
    }
    if (email) req.session.order.email = email;
    if (recipientName) req.session.order.recipientName = recipientName;

    console.log('Updated order in session:', req.session.order);

    if (!req.session.order.product || !req.session.order.size ||
        !req.session.order.color || !req.session.order.quantity) {
        const outputContexts = [{
            name: `${req.body.session}/contexts/delivery_info_context`,
            lifespanCount: 5,
            parameters: {
                order: req.session.order,
                incomplete: true
            }
        }];

        return res.json({
            fulfillmentText: 'Dữ liệu đã bị mất. Vui lòng quay lại bước chọn sản phẩm và tiến hành mua hàng lại!',
            outputContexts: outputContexts
        });
    }

    let missingInfo = [];
    if (!req.session.order.shippingAddress) missingInfo.push('địa chỉ giao hàng');
    if (!req.session.order.phone) missingInfo.push('số điện thoại');
    if (!req.session.order.recipientName) missingInfo.push('tên người nhận');

    const outputContexts = [{
        name: `${req.body.session}/contexts/delivery_info_context`,
        lifespanCount: 5,
        parameters: {
            order: req.session.order
        }
    }];

    if (missingInfo.length === 0) {
        return res.json({
            fulfillmentText: `Thông tin giao hàng đã đầy đủ. Bạn muốn thanh toán bằng phương thức nào? (COD, thẻ tín dụng, chuyển khoản)`,
            outputContexts: outputContexts
        });
    }

    return res.json({
        fulfillmentText: `Vui lòng cung cấp thêm: ${missingInfo.join(', ')}.`,
        outputContexts: outputContexts
    });
}

// Xử lý chọn phương thức thanh toán
// Trong file ChatbotController.js

// Xử lý chọn phương thức thanh toán
async function handlePaymentMethod(parameters, req, res) {
    const { payment_method } = parameters;

    console.log('Payment method parameter:', payment_method);
    console.log('Current session:', req.session);

    const contexts = req.body.queryResult.outputContexts || [];
    const deliveryInfoContext = contexts.find(ctx => ctx.name.includes('delivery_info_context'));
    const selectedProductContext = contexts.find(ctx => ctx.name.includes('selected_product_context'));
    const productSizeContext = contexts.find(ctx => ctx.name.includes('product_size_context'));
    const productColorContext = contexts.find(ctx => ctx.name.includes('product_color_context'));

    if (!req.session.order) {
        req.session.order = {};
    }

    if (deliveryInfoContext && deliveryInfoContext.parameters.order) {
        req.session.order = { ...deliveryInfoContext.parameters.order };
    }
    if (selectedProductContext && selectedProductContext.parameters.selectedProduct) {
        const product = selectedProductContext.parameters.selectedProduct;
        req.session.order.product = product.id;
        req.session.order.productName = product.name;
        req.session.order.price = product.price;
    }
    if (productSizeContext && productSizeContext.parameters.selectedSize) {
        req.session.order.size = productSizeContext.parameters.selectedSize;
    }
    if (productColorContext && productColorContext.parameters.selectedColor) {
        req.session.order.color = productColorContext.parameters.selectedColor;
    }

    if (!req.session.order.product) {
        return res.json({
            fulfillmentText: 'Không tìm thấy thông tin sản phẩm. Vui lòng bắt đầu lại từ bước chọn sản phẩm!'
        });
    }

    let dbPaymentMethod = '';
    if (payment_method.toLowerCase().includes('cod') || payment_method.toLowerCase() === 'tiền mặt' || payment_method.toLowerCase() === 'thanh toán khi nhận hàng') {
        dbPaymentMethod = 'COD';
    } else if (payment_method.toLowerCase().includes('momo') || payment_method.toLowerCase() === 'ví điện tử') {
        dbPaymentMethod = 'MOMO';
    } else if (payment_method.toLowerCase().includes('chuyển khoản') || payment_method.toLowerCase().includes('bank') || payment_method.toLowerCase().includes('thẻ tín dụng') || payment_method.toLowerCase().includes('ngân hàng')) {
        dbPaymentMethod = 'BANK';
    } else {
        return res.json({
            fulfillmentText: 'Phương thức thanh toán không hợp lệ. Vui lòng chọn COD, MOMO hoặc chuyển khoản ngân hàng!'
        });
    }

    req.session.order.paymentMethod = dbPaymentMethod;
    req.session.order.originalPaymentMethod = payment_method;

    try {
        const product = await Product.findById(req.session.order.product);
        if (!product) {
            return res.json({
                fulfillmentText: 'Không tìm thấy thông tin sản phẩm. Vui lòng thử lại!'
            });
        }

        let productPrice = product.price;
        if (product.discount && product.discount.amount && !isNaN(product.discount.amount)) {
            productPrice = product.price * (1 - product.discount.amount / 100);
        }
        if (isNaN(productPrice)) productPrice = product.price;

        const quantity = parseInt(req.session.order.quantity) || 1;
        const totalAmount = productPrice * quantity;

        req.session.order.calculatedPrice = productPrice;
        req.session.order.totalAmount = totalAmount;

        // Tạo dữ liệu đơn hàng với size và color trong products
        const orderData = {
            user: "65ae3051ed28e2cc2cf25b8c",
            products: [{
                product: req.session.order.product,
                quantity: req.session.order.quantity,
                price: productPrice,
                size: req.session.order.size || 'Không xác định', // Lưu size vào products
                color: req.session.order.color || 'Không xác định' // Lưu color vào products
            }],
            shippingAddress: req.session.order.shippingAddress || 'Chưa cung cấp',
            paymentMethod: dbPaymentMethod,
            totalAmount: totalAmount,
            status: 'Pending',
            email: req.session.order.email || '',
            phone: req.session.order.phone || '',
            recipientName: req.session.order.recipientName || ''
        };

        console.log('Dữ liệu đơn hàng trước khi tạo:', orderData);

        const order = await Order.create(orderData);
        console.log('Đơn hàng đã tạo:', order);

        req.session.order.orderId = order._id;

        const orderSummary = [
            '📋 THÔNG TIN ĐƠN HÀNG CỦA BẠN',
            '----------------------------------------',
            `🏷️ Sản phẩm: ${product.name}`,
            `📏 Kích thước: ${req.session.order.size || 'Chưa chọn'}`,
            `🎨 Màu sắc: ${req.session.order.color || 'Chưa chọn'}`,
            `🔢 Số lượng: ${quantity}`,
            `💰 Đơn giá: ${product.price.toLocaleString('vi-VN')} VND`,
            product.discount ? `🏷️ Giảm giá: ${product.discount.amount}%` : '',
            `💵 Thành tiền: ${totalAmount.toLocaleString('vi-VN')} VND`,
            '----------------------------------------',
            `👤 Người nhận: ${req.session.order.recipientName || 'Chưa cung cấp'}`,
            `📱 Số điện thoại: ${req.session.order.phone || 'Chưa cung cấp'}`,
            `✉️ Email: ${req.session.order.email || 'Chưa cung cấp'}`,
            `🏠 Địa chỉ giao hàng: ${req.session.order.shippingAddress || 'Chưa cung cấp'}`,
            `💳 Phương thức thanh toán: ${payment_method}`,
            '----------------------------------------',
        ].filter(Boolean).join('\n');

        const outputContexts = [{
            name: `${req.body.session}/contexts/order_confirmation_context`,
            lifespanCount: 5,
            parameters: {
                orderId: order._id,
                order: req.session.order
            }
        }];

        return res.json({
            fulfillmentText: `${orderSummary}\n\nVui lòng xác nhận thông tin đơn hàng trên. Bạn có muốn nhận hóa đơn qua email không? (Có/Không)`,
            outputContexts: outputContexts
        });
    } catch (error) {
        console.error('Error in handlePaymentMethod:', error);
        return res.json({
            fulfillmentText: `⚠️ Xin lỗi, đã có lỗi xảy ra khi xử lý đơn hàng: ${error.message}. Vui lòng thử lại sau hoặc liên hệ hỗ trợ qua 0382385129.`
        });
    }
}

// Cải thiện hàm xử lý confirm_order để tạo đơn hàng và gửi email
// Xử lý xác nhận đơn hàng và gửi email
async function handleOrderConfirmation(parameters, req, res) {
    const { confirm_email } = parameters;

    console.log('Order confirmation parameters:', confirm_email);
    console.log('Current session:', req.session);

    // Lấy context xác nhận đơn hàng
    const orderConfirmationContext = req.body.queryResult.outputContexts.find(
        context => context.name.includes('order_confirmation_context')
    );

    // Nếu không có context, thử lấy từ session
    if (!orderConfirmationContext || !orderConfirmationContext.parameters.orderId) {
        if (!req.session.order || !req.session.order.orderId) {
            return res.json({
                fulfillmentText: 'Xin lỗi, không thể xác định đơn hàng. Vui lòng bắt đầu lại từ bước chọn sản phẩm hoặc liên hệ 0382385129.'
            });
        }
    }

    const orderId = orderConfirmationContext?.parameters.orderId || req.session.order.orderId;

    // Phân tích phản hồi của người dùng
    const userResponse = (confirm_email || '').toLowerCase();
    const positiveResponses = ['có', 'yes', 'đồng ý', 'ok', 'đúng', 'muốn', 'gửi', 'email', 'e-mail', 'mail'];
    const negativeResponses = ['không', 'no', 'thôi', 'đừng', 'khỏi', 'ko', 'k', 'không cần', 'không muốn'];

    const wantsEmail = positiveResponses.some(word => userResponse.includes(word)) &&
        !negativeResponses.some(word => userResponse.includes(word));

    // Trích xuất email từ câu trả lời nếu có
    let emailToUse = req.session.order?.email || '';
    const emailMatch = userResponse.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch) {
        emailToUse = emailMatch[0];
        console.log('Email mới từ câu trả lời:', emailToUse);
    }

    try {
        // Lấy thông tin đơn hàng từ database
        const order = await Order.findById(orderId).populate({
            path: 'products.product',
            populate: { path: 'discount' }
        });

        if (!order) {
            return res.json({
                fulfillmentText: `Không tìm thấy đơn hàng #${orderId}. Vui lòng liên hệ với chúng tôi qua số điện thoại 0382385129.`
            });
        }

        if (wantsEmail) {
            if (!emailToUse) {
                // Nếu không có email, yêu cầu người dùng cung cấp và lưu context chờ email
                const outputContexts = [{
                    name: `${req.body.session}/contexts/waiting_for_email_context`,
                    lifespanCount: 5,
                    parameters: {
                        orderId: order._id
                    }
                }];
                return res.json({
                    fulfillmentText: '📧 Vui lòng cung cấp địa chỉ email của bạn để nhận hóa đơn.',
                    outputContexts: outputContexts
                });
            }

            // Cập nhật email vào đơn hàng nếu cần
            if (emailToUse !== order.email) {
                order.email = emailToUse;
                await order.save();
            }

            // Tạo nội dung hóa đơn
            const product = order.products[0].product;
            const productInfo = {
                name: product.name,
                price: order.products[0].price,
                discount: product.discount
            };
            const invoiceContent = generateInvoiceContent(order, productInfo);

            // Gửi email với tham số rõ ràng
            await sendEmail({
                email: emailToUse,
                subject: 'Hóa đơn mua hàng từ cửa hàng giày',
                html: invoiceContent
            });

            // Xóa session sau khi hoàn tất
            delete req.session.order;
            delete req.session.selectedProduct;

            return res.json({
                fulfillmentText: `✅ Đơn hàng đã được xác nhận!\n📧 Hóa đơn đã được gửi đến ${emailToUse}.\n💌 Cảm ơn bạn đã mua hàng!`
            });
        } else {
            // Không muốn nhận email
            delete req.session.order;
            delete req.session.selectedProduct;

            return res.json({
                fulfillmentText: `✅ Đơn hàng đã được xác nhận!\n💌 Cảm ơn bạn đã mua hàng! Chúng tôi sẽ liên hệ sớm để xác nhận.`
            });
        }
    } catch (error) {
        console.error('Order confirmation error:', error);
        return res.json({
            fulfillmentText: `⚠️ Xin lỗi, đã có lỗi xảy ra: ${error.message}. Vui lòng liên hệ 0382385129 để được hỗ trợ.`
        });
    }
}

// Xử lý email được cung cấp sau khi yêu cầu
async function handleLateEmail(parameters, req, res) {
    const { email } = parameters;

    console.log('Late email parameters:', email);

    const waitingForEmailContext = req.body.queryResult.outputContexts.find(
        context => context.name.includes('waiting_for_email_context')
    );

    if (!waitingForEmailContext || !waitingForEmailContext.parameters.orderId) {
        return res.json({
            fulfillmentText: 'Xin lỗi, không thể xác định đơn hàng để gửi email. Vui lòng liên hệ 0382385129.'
        });
    }

    const orderId = waitingForEmailContext.parameters.orderId;

    if (!email || !email.includes('@') || !email.includes('.')) {
        return res.json({
            fulfillmentText: 'Địa chỉ email không hợp lệ. Vui lòng cung cấp email chính xác.'
        });
    }

    try {
        const order = await Order.findById(orderId).populate({
            path: 'products.product',
            populate: { path: 'discount' }
        });

        if (!order) {
            return res.json({
                fulfillmentText: `Không tìm thấy đơn hàng #${orderId}. Vui lòng liên hệ 0382385129.`
            });
        }

        order.email = email;
        await order.save();

        const product = order.products[0].product;
        const productInfo = {
            name: product.name,
            price: order.products[0].price,
            discount: product.discount
        };
        const invoiceContent = generateInvoiceContent(order, productInfo);
        console.log({ "invoiceContent": invoiceContent });

        await sendEmail(email, 'Hóa đơn mua hàng từ cửa hàng giày', invoiceContent);

        delete req.session.order;
        delete req.session.selectedProduct;

        return res.json({
            fulfillmentText: `✅ Hóa đơn đã được gửi đến ${email}.\n💌 Cảm ơn bạn đã mua hàng!`
        });
    } catch (error) {
        console.error('Late email error:', error);
        return res.json({
            fulfillmentText: `⚠️ Lỗi khi gửi email: ${error.message}. Vui lòng liên hệ 0382385129 để được hỗ trợ.`
        });
    }
}

// Xử lý tìm sản phẩm theo thương hiệu
async function handleProductByBrand(parameters, req, res) {
    const { brand } = parameters;
    try {
        const products = await Product.find({ brand: { $regex: brand, $options: 'i' } })
            .populate('category')
            .populate('discount')
            .limit(5);

        return handleProductResults(products, `thương hiệu ${brand}`, req, res);
    } catch (error) {
        console.error('Brand search error:', error);
        return handleError(res);
    }
}

// Hàm hỗ trợ xử lý kết quả sản phẩm
function handleProductResults(products, searchCriteria, req, res) {
    if (products.length === 0) {
        return res.json({
            fulfillmentText: `Không tìm thấy sản phẩm nào với ${searchCriteria}.`
        });
    }

    const productList = products.map((p, index) => {
        const discountedPrice = p.discount
            ? p.price * (1 - p.discount.amount / 100)
            : p.price;
        return `${index + 1}. ${p.name}\n` +
            `   💰 Giá: ${p.price.toLocaleString('vi-VN')} VND\n` +
            (p.discount ? `   🏷️ Giảm giá: ${p.discount.amount}% còn ${discountedPrice.toLocaleString('vi-VN')} VND\n` : '') +
            `   📏 Size: ${p.sizes.join(', ')}\n` +
            `   🎨 Màu sắc: ${p.colors.join(', ')}`;
    }).join('\n\n');

    const outputContexts = [{
        name: `${req.body.session}/contexts/product_list_context`,
        lifespanCount: 5,
        parameters: {
            products: products,
            searchCriteria: searchCriteria
        }
    }];

    return res.json({
        fulfillmentText:
            `Tìm thấy ${products.length} sản phẩm với ${searchCriteria}:\n\n${productList}\n\n` +
            `Bạn muốn xem chi tiết sản phẩm nào? Hãy nói "chọn số [1-${products.length}]" hoặc "chọn [tên sản phẩm]"`,
        outputContexts: outputContexts
    });
}

// Hàm xử lý lỗi
function handleError(res) {
    return res.json({
        fulfillmentText: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.'
    });
}

// Hàm xử lý mặc định
function handleDefaultResponse(req, res) {
    return res.json({
        fulfillmentText: 'Xin lỗi, tôi không hiểu yêu cầu của bạn. Vui lòng thử lại hoặc hỏi theo cách khác.'
    });
}

export default ChatbotController;