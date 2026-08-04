import { authService } from './lib/modules/auth/auth.service';

async function test() {
  try {
    const res = await authService.register({
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User'
    });
    console.log('Success:', res);
  } catch (err) {
    console.error('Failure:', err);
  }
}

test();
