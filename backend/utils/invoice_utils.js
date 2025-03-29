import nodemailer from 'nodemailer';

// Hàm tạo nội dung hóa đơn
export function generateInvoiceContent(order, product) {
    try {
        const productPrice = product.price || 0;
        const discountPercent = product.discount ? product.discount.amount || 0 : 0;
        const discountAmount = productPrice * (discountPercent / 100);
        const finalPrice = productPrice - discountAmount;
        const quantity = order.products[0]?.quantity || 1;
        const totalAmount = finalPrice * quantity;

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Hóa đơn mua hàng</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                .invoice { max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                .logo { font-size: 20px; font-weight: bold; color: #444; }
                .info { margin-bottom: 20px; }
                .info-item { margin-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f9f9f9; }
                .total { text-align: right; margin-top: 20px; font-weight: bold; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }
            </style>
        </head>
        <body>
            <div class="invoice">
                <div class="header">
                    <div class="logo">HỆ THỐNG CỬA HÀNG GIÀY</div>
                    <div>Xác nhận đơn hàng</div>
                </div>
                
                <p>Xin chào ${order.recipientName || 'Quý khách'},</p>
                <p>Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi. Dưới đây là thông tin đơn hàng của bạn:</p>
                
                <div class="info">
                    <div class="info-item"><strong>Mã đơn hàng:</strong> ${order._id}</div>
                    <div class="info-item"><strong>Ngày đặt:</strong> ${new Date().toLocaleString('vi-VN')}</div>
                    <div class="info-item"><strong>Địa chỉ:</strong> ${order.shippingAddress || 'Chưa cung cấp'}</div>
                    <div class="info-item"><strong>Phương thức thanh toán:</strong> ${order.paymentMethod}</div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Size</th>
                            <th>Màu sắc</th>
                            <th>Đơn giá</th>
                            <th>SL</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${product.name || 'Sản phẩm'}</td>
                            <td>${order.products[0].size || 'Không xác định'}</td>
                            <td>${order.products[0].color || 'Không xác định'}</td>
                            <td>${productPrice.toLocaleString('vi-VN')} VNĐ</td>
                            <td>${quantity}</td>
                            <td>${totalAmount.toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="total">
                    <div>Giảm giá: ${discountPercent}% (${discountAmount.toLocaleString('vi-VN')} VNĐ)</div>
                    <div><strong>Tổng cộng:</strong> ${totalAmount.toLocaleString('vi-VN')} VNĐ</div>
                </div>
                
                <p>Chúng tôi sẽ liên hệ với bạn để xác nhận và giao hàng trong thời gian sớm nhất.</p>
                
                <div class="footer">
                    <p>Cảm ơn bạn đã mua hàng tại cửa hàng chúng tôi!</p>
                    <p>Mọi thắc mắc xin liên hệ: 0382385129 hoặc email: support@shoesstore.com</p>
                </div>
            </div>
        </body>
        </html>
        `;
    } catch (error) {
        console.error('Lỗi khi tạo nội dung email:', error);
        return `Đơn hàng của bạn đã được xác nhận. Mã đơn hàng: ${order._id}. Cảm ơn bạn đã mua hàng!`;
    }
}
// Hàm gửi email
export async function sendEmail({ email, subject, html }) {
    console.log('Bắt đầu gửi email với thông tin:', { email, subject, html: html ? 'Có nội dung' : 'Không có nội dung' });

    if (!email || !email.includes('@')) {
        throw new Error('Email không hợp lệ');
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Thiếu cấu hình email trong file .env');
        throw new Error('Thiếu cấu hình email trong file .env');
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Cửa hàng giày" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject || 'Hóa đơn mua hàng từ cửa hàng giày', // Giá trị mặc định nếu subject undefined
            html: html || '<p>Không có nội dung hóa đơn.</p>' // Giá trị mặc định nếu html undefined
        };

        console.log('Đang gửi email đến:', email);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email đã được gửi:', info.messageId);
        return info;
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
        throw error;
    }
}

export default {
    generateInvoiceContent,
    sendEmail
};