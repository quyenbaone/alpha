/*
  # Add sample data with admin user

  1. Changes
    - Create admin user
    - Add sample equipment items with Vietnamese descriptions
*/

-- First create the admin user if it doesn't exist
INSERT INTO auth.users (id, email)
SELECT 
  gen_random_uuid(),
  'admin@gmail.com'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@gmail.com'
)
RETURNING id;

-- Then insert the equipment data using the admin user's ID
INSERT INTO equipment (title, description, price, category, image, location, owner_id, rating, reviews)
SELECT
  title,
  description,
  price,
  category,
  image,
  location,
  (SELECT id FROM auth.users WHERE email = 'admin@gmail.com'),
  rating,
  reviews
FROM (
  VALUES
    (
      'Máy ảnh Canon EOS R5',
      'Máy ảnh mirrorless chuyên nghiệp với cảm biến full-frame 45MP, quay video 8K, chống rung IBIS 5 trục',
      150,
      'Photography',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3',
      'Hà Nội',
      4.8,
      12
    ),
    (
      'Loa JBL PartyBox 310',
      'Loa di động công suất lớn với đèn LED RGB, pin sử dụng 18 giờ, công suất 240W',
      80,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?ixlib=rb-4.0.3',
      'TP HCM',
      4.9,
      8
    ),
    (
      'Lều cắm trại 4 người Coleman',
      'Lều chống nước cao cấp, dễ dàng dựng, thích hợp cho gia đình và nhóm bạn',
      45,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3',
      'Đà Nẵng',
      4.7,
      15
    ),
    (
      'Ván SUP điện Bluedrive',
      'Ván SUP điện thông minh với động cơ 5 cấp độ, pin 4 giờ sử dụng',
      120,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1526188717906-ab4a2f949f47?ixlib=rb-4.0.3',
      'Nha Trang',
      4.6,
      6
    )
) AS t(title, description, price, category, image, location, rating, reviews);