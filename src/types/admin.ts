// API Standard Response
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  meta?: {
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    total?: number;
    limit?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  } | null;
}

// Admin Profile
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: 'admin' | 'customer' | 'reseller';
  avatarUrl?: string | null;
}

// Payment Account Model
export interface PaymentAccount {
  id: string;
  type: 'bank_transfer' | 'qris';
  providerName: string;
  accountNumber: string;
  accountHolderName: string;
  qrImageUrl?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Order & Items Models
export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  packageName?: string | null;
  productName: string;
  colorName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  weightGrams: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status:
    | 'pending_payment'
    | 'awaiting_payment_reupload'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'completed'
    | 'cancelled_permanent'
    | 'cancelled_expired'
    | string;
  pricing: {
    regularSubtotal: number;
    packageSubtotal: number;
    discountProductTotal: number;
    shippingFee: number;
    discountShippingTotal: number;
    netTotal: number;
  };
  shipping: {
    totalWeightGrams: number;
    address: {
      recipientName: string;
      phoneNumber: string;
      province: string;
      city: string;
      district: string;
      subdistrict?: string;
      postalCode: string;
      fullAddress: string;
    };
    shipment?: {
      waybillNumber: string;
      courierName: string;
      serviceType: string;
      status: string;
      trackingLogs: Array<{
        dateTime: string;
        status: string;
        description: string;
        city: string;
      }>;
    } | null;
  };
  payment?: {
    id: string;
    amount: number;
    status: 'pending' | 'waiting_verification' | 'paid' | 'rejected' | string;
    proofImageUrl?: string | null;
    senderBankName?: string | null;
    senderAccountName?: string | null;
    transferDate?: string | null;
    rejectionReason?: string | null;
    reuploadAttempts: number;
    account?: {
      type: string;
      provider: string;
      accountNumber: string;
      holder: string;
      qrImage?: string | null;
    };
  } | null;
  items: OrderItem[];
  expiresAt: string;
  createdAt: string;
}

// Shipment Checkpoint
export interface ShipmentCheckpoint {
  dateTime: string;
  status: 'picked_up' | 'on_transit' | 'delivered' | 'failed' | string;
  description: string;
  city: string;
}

// Notification Model
export interface AdminNotification {
  id: string;
  userId?: string | null;
  targetAudience?: 'all' | 'customer' | 'reseller' | string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'shipping' | 'promo' | 'announcement' | 'system' | string;
  isRead: boolean;
  createdAt: string;
}

// Socket Events
export interface OrderNewEvent {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
}

export interface PaymentUploadedEvent {
  orderId: string;
  orderNumber: string;
  amount: number;
}
