import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Login');
    await expect(page).toHaveURL('/auth/login');
    await expect(page.locator('h1')).toContainText('Sign In');
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/login');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Please enter a valid email')).toBeVisible();
  });

  test('should handle login attempt', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Since we don't have a real backend, expect to see loading state
    await expect(page.locator('text=Signing in')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/auth/login');
    
    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('button[aria-label="Toggle password visibility"]');
    
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    await toggleButton.click();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/auth/login');
    await page.click('text=Create new account');
    
    await expect(page).toHaveURL('/auth/register');
    await expect(page.locator('h1')).toContainText('Create Account');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/auth/login');
    await page.click('text=Forgot your password?');
    
    await expect(page).toHaveURL('/auth/forgot-password');
    await expect(page.locator('h1')).toContainText('Reset Password');
  });
});

test.describe('Registration Flow', () => {
  test('should show registration form', async ({ page }) => {
    await page.goto('/auth/register');
    
    await expect(page.locator('input[placeholder*="name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/auth/register');
    
    await page.fill('input[type="password"]', 'weak');
    await page.click('input[type="email"]'); // Trigger blur
    
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });

  test('should handle registration attempt', async ({ page }) => {
    await page.goto('/auth/register');
    
    await page.fill('input[placeholder*="name"]', 'John Doe');
    await page.fill('input[type="email"]', 'john@example.com');
    await page.fill('input[type="password"]', 'StrongPass123!');
    await page.click('button[type="submit"]');
    
    // Since we don't have a real backend, expect to see loading state
    await expect(page.locator('text=Creating account')).toBeVisible();
  });
});

test.describe('Password Reset Flow', () => {
  test('should show forgot password form', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Reset Password');
  });

  test('should handle password reset request', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    // Expect to see success message or loading state
    await expect(page.locator('text=Sending reset link')).toBeVisible();
  });

  test('should return to login from forgot password', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await page.click('text=Back to Sign In');
    
    await expect(page).toHaveURL('/auth/login');
  });
});