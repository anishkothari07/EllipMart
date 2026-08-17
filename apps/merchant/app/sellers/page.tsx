import { getSellersAction } from './actions';
import SellersClient from './sellers-client';

export const metadata = {
  title: 'Sellers | EllipMart Super Admin',
  description: 'Manage seller accounts on EllipMart.',
};

export default async function SellersPage() {
  const result = await getSellersAction();
  const sellers = result.success ? result.data ?? [] : [];

  return <SellersClient sellers={sellers} />;
}
