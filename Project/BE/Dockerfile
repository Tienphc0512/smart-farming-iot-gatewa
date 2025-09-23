# Sử dụng image chính thức của Node.js
FROM node:18-alpine

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy file khai báo package trước (tăng tốc độ cache)
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# Copy toàn bộ source code vào container
COPY . .

# Mở cổng ứng dụng nếu server.js dùng cổng này (có thể sửa nếu bạn dùng cổng khác)
EXPOSE 5555
ENV TZ=Asia/Ho_Chi_Minh


# Lệnh khởi động ứng dụng
CMD ["node", "server.js"]
