export interface Product {
  id: string;
  title: string;
  price: string;
  period: 'monthly' | 'yearly';
}

export const PRODUCT_CATALOG: Product[] = [
  {
    id: 'com.mosaicstudio.premium.monthly',
    title: 'Premium Monthly',
    price: '$4.99',
    period: 'monthly',
  },
  {
    id: 'com.mosaicstudio.premium.yearly',
    title: 'Premium Yearly',
    price: '$29.99',
    period: 'yearly',
  },
];
