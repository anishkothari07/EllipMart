import { shoppingProductService } from './packages/commerce/src/shopping/shopping-product.service';
async function main() {
  console.log('calling...');
  try {
    const products = await shoppingProductService.listProducts({});
    console.log('success', products.items.length);
  } catch (e) {
    console.error('ERROR:', e);
  }
}
main();
