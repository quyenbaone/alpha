/*
  # Add sample equipment data

  1. Changes
    - Add sample equipment items for each category
    - All items are owned by the admin user
    - All descriptions are in Vietnamese
*/

-- Insert sample equipment data
INSERT INTO equipment (title, description, price, category, image, location, owner_id, rating, reviews)
SELECT
  title,
  description,
  price,
  category,
  image,
  location,
  (SELECT id FROM users WHERE email = 'admin@gmail.com'),
  rating,
  reviews
FROM (
  VALUES
    (
      'Canon EOS R5',
      'Máy ảnh mirrorless chuyên nghiệp với cảm biến full-frame 45MP, quay video 8K, chống rung IBIS 5 trục',
      2400000,
      'Photography',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
      'Hà Nội',
      4.8,
      12
    ),
    (
      'Sony A7 III',
      'Máy ảnh mirrorless full-frame 24MP, quay video 4K, chống rung 5 trục',
      1800000,
      'Photography',
      'https://images.unsplash.com/photo-1516724562728-afc4865086e7',
      'TP HCM',
      4.9,
      15
    ),
    (
      'JBL PartyBox 310',
      'Loa di động công suất lớn với đèn LED RGB, pin sử dụng 18 giờ, công suất 240W',
      800000,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d',
      'Đà Nẵng',
      4.7,
      8
    ),
    (
      'Shure SM7B',
      'Micro thu âm chuyên nghiệp, chuẩn XLR, chống ồn tốt',
      500000,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc',
      'Hải Phòng',
      4.8,
      10
    ),
    (
      'Coleman Sundome',
      'Lều cắm trại 4 người, chống nước, dễ dàng dựng, thích hợp cho gia đình',
      450000,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
      'Nha Trang',
      4.6,
      20
    ),
    (
      'Mountain Hardwear Phantom',
      'Túi ngủ mùa đông -18°C, lông vũ 800-fill',
      350000,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7',
      'Đà Lạt',
      4.7,
      15
    ),
    (
      'Red Paddle Co Sport',
      'Ván SUP bơm hơi 12''6", touring, racing',
      900000,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1526188717906-ab4a2f949f47',
      'Vũng Tàu',
      4.9,
      18
    ),
    (
      'Starboard Touring',
      'Ván SUP cứng 14", carbon, racing',
      1200000,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1517176118179-65244903d13c',
      'Quy Nhơn',
      4.8,
      14
    )
) AS t(title, description, price, category, image, location, rating, reviews);