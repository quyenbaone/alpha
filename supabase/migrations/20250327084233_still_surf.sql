/*
  # Add more sample equipment data

  1. Changes
    - Add 15 items for each equipment category (Photography, Audio Equipment, Camping Gear, SUP Equipment)
    - All items are owned by the admin user
    - All descriptions are in Vietnamese
*/

-- Insert more sample equipment data
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
    -- Photography Equipment (15 items)
    (
      'Canon EOS R6',
      'Máy ảnh mirrorless full-frame 20MP, quay video 4K 60fps, chống rung IBIS',
      120,
      'Photography',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3',
      'Hà Nội',
      4.7,
      18
    ),
    (
      'Sony A7 III',
      'Máy ảnh mirrorless full-frame 24MP, quay video 4K, chống rung 5 trục',
      130,
      'Photography',
      'https://images.unsplash.com/photo-1516724562728-afc4865086e7?ixlib=rb-4.0.3',
      'TP HCM',
      4.8,
      25
    ),
    (
      'Nikon Z6',
      'Máy ảnh mirrorless full-frame 24MP, quay video 4K N-Log, chống rung VR',
      125,
      'Photography',
      'https://images.unsplash.com/photo-1515630278258-407f66498911?ixlib=rb-4.0.3',
      'Đà Nẵng',
      4.6,
      15
    ),
    (
      'Fujifilm X-T4',
      'Máy ảnh mirrorless APS-C 26MP, quay video 4K 60fps, màn hình xoay lật',
      100,
      'Photography',
      'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?ixlib=rb-4.0.3',
      'Hải Phòng',
      4.7,
      20
    ),
    (
      'DJI RS 3 Pro',
      'Gimbal chuyên nghiệp cho máy ảnh, tải trọng 4.5kg, màn hình cảm ứng',
      80,
      'Photography',
      'https://images.unsplash.com/photo-1589535540825-0cc0c6c12069?ixlib=rb-4.0.3',
      'Nha Trang',
      4.5,
      12
    ),
    (
      'Canon RF 24-70mm f/2.8',
      'Ống kính zoom tiêu chuẩn chuyên nghiệp cho máy ảnh Canon RF',
      90,
      'Photography',
      'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?ixlib=rb-4.0.3',
      'Cần Thơ',
      4.9,
      30
    ),
    (
      'Sony 70-200mm f/2.8 GM',
      'Ống kính tele zoom chuyên nghiệp cho máy ảnh Sony E-mount',
      95,
      'Photography',
      'https://images.unsplash.com/photo-1516035645876-b542f6603f1d?ixlib=rb-4.0.3',
      'Đà Lạt',
      4.8,
      22
    ),
    (
      'Godox AD600 Pro',
      'Đèn flash studio không dây, công suất 600Ws, pin lithium',
      70,
      'Photography',
      'https://images.unsplash.com/photo-1542567455-cd733f23fbb1?ixlib=rb-4.0.3',
      'Vũng Tàu',
      4.6,
      16
    ),
    (
      'DJI Mini 3 Pro',
      'Flycam nhỏ gọn, camera 4K, thời gian bay 34 phút',
      85,
      'Photography',
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3',
      'Huế',
      4.7,
      28
    ),
    (
      'Profoto B10 Plus',
      'Đèn flash studio di động, công suất 500Ws, đèn LED modeling',
      75,
      'Photography',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3',
      'Quy Nhơn',
      4.5,
      14
    ),
    (
      'SmallRig Camera Cage',
      'Khung máy ảnh đa năng với nhiều điểm gắn phụ kiện',
      40,
      'Photography',
      'https://images.unsplash.com/photo-1495512046360-dad6e8b83667?ixlib=rb-4.0.3',
      'Hà Nội',
      4.4,
      10
    ),
    (
      'Zhiyun Weebill 3',
      'Gimbal nhỏ gọn cho máy ảnh mirrorless, tải trọng 3kg',
      65,
      'Photography',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3',
      'TP HCM',
      4.6,
      19
    ),
    (
      'Manfrotto MT055XPRO4',
      'Chân máy ảnh chuyên nghiệp, chiều cao tối đa 170cm',
      50,
      'Photography',
      'https://images.unsplash.com/photo-1542601110-3ea6e32991c3?ixlib=rb-4.0.3',
      'Đà Nẵng',
      4.7,
      24
    ),
    (
      'Aputure 600d Pro',
      'Đèn LED studio chuyên nghiệp, công suất 600W, Bowens Mount',
      110,
      'Photography',
      'https://images.unsplash.com/photo-1542611436-f73ffbf79338?ixlib=rb-4.0.3',
      'Hải Phòng',
      4.8,
      21
    ),
    (
      'BlackMagic Pocket 6K',
      'Máy quay phim chuyên nghiệp, cảm biến Super 35, RAW 6K',
      150,
      'Photography',
      'https://images.unsplash.com/photo-1589535540825-0cc0c6c12069?ixlib=rb-4.0.3',
      'Nha Trang',
      4.9,
      17
    ),

    -- Audio Equipment (15 items)
    (
      'Shure SM7B',
      'Micro thu âm chuyên nghiệp, chuẩn XLR, chống ồn tốt',
      70,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?ixlib=rb-4.0.3',
      'Hà Nội',
      4.8,
      32
    ),
    (
      'RodeCaster Pro II',
      'Bàn mixer podcast chuyên nghiệp, 4 kênh XLR, effects',
      120,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?ixlib=rb-4.0.3',
      'TP HCM',
      4.9,
      28
    ),
    (
      'Yamaha HS8',
      'Loa kiểm âm studio 8 inch, công suất 120W',
      90,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1558089687-f282ffcbc126?ixlib=rb-4.0.3',
      'Đà Nẵng',
      4.7,
      25
    ),
    (
      'Universal Audio Apollo Twin X',
      'Sound card thu âm chuyên nghiệp, 24-bit/192 kHz',
      150,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1558089687-f282ffcbc126?ixlib=rb-4.0.3',
      'Hải Phòng',
      4.9,
      20
    ),
    (
      'Sennheiser EW 100 G4',
      'Micro không dây chuyên nghiệp, dải tần UHF',
      85,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3',
      'Nha Trang',
      4.6,
      18
    ),
    (
      'QSC K12.2',
      'Loa active 12 inch, công suất 2000W, DSP',
      100,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1547394765-185e1e68f34e?ixlib=rb-4.0.3',
      'Cần Thơ',
      4.8,
      30
    ),
    (
      'Pioneer CDJ-3000',
      'Đầu DJ chuyên nghiệp, màn hình cảm ứng 9 inch',
      130,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1571935441005-16c6aa4b2bcd?ixlib=rb-4.0.3',
      'Đà Lạt',
      4.9,
      22
    ),
    (
      'Allen & Heath Xone:96',
      'Mixer DJ analog 6 kênh, effects send/return',
      110,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3',
      'Vũng Tàu',
      4.7,
      15
    ),
    (
      'Electro-Voice ELX200-12P',
      'Loa active 12 inch, công suất 1200W, DSP',
      95,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1524557541429-b7d0425572ff?ixlib=rb-4.0.3',
      'Huế',
      4.6,
      20
    ),
    (
      'Behringer X32',
      'Mixer kỹ thuật số 32 kênh, effects, recording',
      140,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3',
      'Quy Nhơn',
      4.8,
      25
    ),
    (
      'AKG C414 XLII',
      'Micro condenser studio, 9 polar patterns',
      80,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?ixlib=rb-4.0.3',
      'Hà Nội',
      4.9,
      28
    ),
    (
      'RCF ART 745-A',
      'Loa active 15 inch, công suất 1400W, DSP',
      120,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1547394765-185e1e68f34e?ixlib=rb-4.0.3',
      'TP HCM',
      4.7,
      22
    ),
    (
      'Focusrite Scarlett 18i20',
      'Sound card thu âm 18 in/20 out, preamps',
      100,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1558089687-f282ffcbc126?ixlib=rb-4.0.3',
      'Đà Nẵng',
      4.8,
      19
    ),
    (
      'Shure PSM 300',
      'Hệ thống in-ear monitor không dây chuyên nghiệp',
      90,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3',
      'Hải Phòng',
      4.6,
      16
    ),
    (
      'DPA 4099',
      'Micro nhạc cụ chuyên nghiệp, clip-on',
      75,
      'Audio Equipment',
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?ixlib=rb-4.0.3',
      'Nha Trang',
      4.7,
      20
    ),

    -- Camping Gear (15 items)
    (
      'The North Face Basecamp',
      'Lều 4 mùa chống nước, 4 người, 2 cửa, 2 mái hiên',
      60,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3',
      'Hà Nội',
      4.8,
      35
    ),
    (
      'Mountain Hardwear Phantom',
      'Túi ngủ mùa đông -18°C, lông vũ 800-fill',
      45,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3',
      'TP HCM',
      4.7,
      28
    ),
    (
      'MSR WindBurner',
      'Bếp cắm trại cao cấp, hiệu suất cao, chống gió',
      35,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3',
      'Đà Nẵng',
      4.6,
      22
    ),
    (
      'Gregory Baltoro 75',
      'Balo phượt 75L, khung nhôm, nhiều ngăn',
      40,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3',
      'Hải Phòng',
      4.9,
      30
    ),
    (
      'Black Diamond Distance Z',
      'Gậy trekking carbon, gấp gọn 3 đoạn',
      25,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3',
      'Nha Trang',
      4.7,
      25
    ),
    (
      'Helinox Chair One',
      'Ghế xếp siêu nhẹ, chịu tải 145kg',
      20,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3',
      'Cần Thơ',
      4.8,
      32
    ),
    (
      'Nemo Tensor',
      'Đệm hơi 4 mùa, nhẹ, cách nhiệt tốt',
      30,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3',
      'Đà Lạt',
      4.6,
      20
    ),
    (
      'Goal Zero Yeti 400',
      'Pin dự phòng công suất lớn, 400Wh, inverter',
      50,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3',
      'Vũng Tàu',
      4.9,
      28
    ),
    (
      'BioLite CampStove 2+',
      'Bếp củi tích hợp sạc USB, quạt điều khiển',
      35,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3',
      'Huế',
      4.7,
      24
    ),
    (
      'Sea to Summit X-Set',
      'Bộ nồi xếp gọn 3 món, silicon food-grade',
      25,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3',
      'Quy Nhơn',
      4.8,
      26
    ),
    (
      'Osprey Exos 58',
      'Balo phượt siêu nhẹ 58L, khung lưới',
      45,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3',
      'Hà Nội',
      4.9,
      35
    ),
    (
      'Jetboil Flash',
      'Bếp gas du lịch, đun sôi nhanh 1L/100s',
      30,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3',
      'TP HCM',
      4.7,
      28
    ),
    (
      'Big Agnes Copper Spur',
      'Lều 3 mùa siêu nhẹ, 2 người, 2 cửa',
      55,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3',
      'Đà Nẵng',
      4.8,
      30
    ),
    (
      'Therm-a-Rest NeoAir',
      'Đệm hơi 4 mùa cao cấp, R-value 6.9',
      40,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3',
      'Hải Phòng',
      4.6,
      22
    ),
    (
      'Petzl Actik Core',
      'Đèn đội đầu sạc USB, 450 lumens',
      25,
      'Camping Gear',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3',
      'Nha Trang',
      4.7,
      25
    ),

    -- SUP Equipment (15 items)
    (
      'Red Paddle Co Sport',
      'Ván SUP bơm hơi 12''6", touring, racing',
      80,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1526188717906-ab4a2f949f47?ixlib=rb-4.0.3',
      'Hà Nội',
      4.9,
      40
    ),
    (
      'Starboard Touring',
      'Ván SUP cứng 14", carbon, racing',
      120,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1517176118179-65244903d13c?ixlib=rb-4.0.3',
      'TP HCM',
      4.8,
      35
    ),
    (
      'iRocker All-Around',
      'Ván SUP bơm hơi 11", đa năng',
      70,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1526188717906-ab4a2f949f47?ixlib=rb-4.0.3',
      'Đà Nẵng',
      4.7,
      30
    ),
    (
      'Werner Cyprus',
      'Mái chèo carbon cao cấp, 2 mảnh',
      45,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1517176118179-65244903d13c?ixlib=rb-4.0.3',
      'Hải Phòng',
      4.8,
      25
    ),
    (
      'NRS Earl 6',
      'Áo phao SUP chuyên dụng, nhiều túi',
      30,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1526188717906-ab4a2f949f47?ixlib=rb-4.0.3',
      'Nha Trang',
      4.6,
      20
    ),
    (
      'Blackfin Model XL',
      'Ván SUP bơm hơi 11''6", fishing, yoga',
      85,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1517176118179-65244903d13c?ixlib=rb-4.0.3',
      'Cần Thơ',
      4.9,
      38
    ),
    (
      'Hobie Mirage Eclipse',
      'Ván SUP đạp chân, tay lái, fitness',
      130,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1526188717906-ab4a2f949f47?ixlib=rb-4.0.3',
      'Đà Lạt',
      4.8,
      28
    ),
    (
      'FCS SUP Deck Pad',
      'Tấm lót chân ván SUP, chống trượt',
      25,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1517176118179-65244903d13c?ixlib=rb-4.0.3',
      'Vũng Tàu',
      4.5,
      15
    ),
    (
      'Red Original Pro Change',
      'Áo thay đồ chống nước, giữ nhiệt',
      35,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1526188717906-ab4a2f949f47?ixlib=rb-4.0.3',
      'Huế',
      4.7,
      22
    ),
    (
      'Thurso Surf Waterwalker',
      'Ván SUP bơm hơi 10''6", touring',
      75,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1517176118179-65244903d13c?ixlib=rb-4.0.3',
      'Quy Nhơn',
      4.8,
      32
    ),
    (
      'Jobe Aero SUP Pump',
      'Bơm điện 2 chiều, pin sạc, 16PSI',
      40,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1526188717906-ab4a2f949f47?ixlib=rb-4.0.3',
      'Hà Nội',
      4.6,
      18
    ),
    (
      'SIC Maui Okeanos',
      'Ván SUP cứng 14", racing, touring',
      140,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1517176118179-65244903d13c?ixlib=rb-4.0.3',
      'TP HCM',
      4.9,
      35
    ),
    (
      'Aqua Marina Fusion',
      'Ván SUP bơm hơi 10''10", đa năng',
      65,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1526188717906-ab4a2f949f47?ixlib=rb-4.0.3',
      'Đà Nẵng',
      4.7,
      28
    ),
    (
      'Peak Expedition',
      'Ván SUP bơm hơi 11", touring, racing',
      90,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1517176118179-65244903d13c?ixlib=rb-4.0.3',
      'Hải Phòng',
      4.8,
      30
    ),
    (
      'Body Glove Performer',
      'Ván SUP bơm hơi 11", yoga, fitness',
      80,
      'SUP Equipment',
      'https://images.unsplash.com/photo-1526188717906-ab4a2f949f47?ixlib=rb-4.0.3',
      'Nha Trang',
      4.7,
      25
    )
) AS t(title, description, price, category, image, location, rating, reviews);