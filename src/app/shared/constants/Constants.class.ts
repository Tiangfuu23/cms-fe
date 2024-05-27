export class Constant {
  public static readonly ROLES = {
    1: 'Admin',
    2: 'Manager',
    3: 'Staff'
  }

  public static readonly PRODUCT_STATUS = {
  //     In Stock: The product is available and ready for sale.
  // Out of Stock: The product is currently unavailable.
  // Low Stock: The product is available but the quantity is low and needs replenishment.
  'INSTOCK': 1,
  'OUTOFSTOCK': 2,
  'LOWSTOCK': 3,
  }

  public static readonly PAYMENT_METHOD = {
    'Cash' : 1,
    'Bank' : 2,
    'Credit card': 3
  }
}

export class StorageKeys {
  public static readonly APP_CONFIG = 'app_config';
  public static readonly TOKEN = 'token';
  public static readonly USER_INFO = 'user_info';
}
