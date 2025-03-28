/*
  # Update prices to VND currency

  1. Changes
    - Multiply all equipment prices by 24000 to convert from USD to VND
    - Prices will now be in thousands of VND
*/

-- Update existing equipment prices to VND (multiply by 24000)
UPDATE equipment
SET price = price * 24000;