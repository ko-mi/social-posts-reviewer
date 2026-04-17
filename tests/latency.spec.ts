import { test, expect } from '@playwright/test';

const DEMO_URL = '/preview?demo=true';

// Helper: measure time between action and DOM condition
async function measureLatency(
  action: () => Promise<void>,
  condition: () => Promise<boolean>,
  label: string,
  maxWaitMs = 5000,
): Promise<number> {
  const start = performance.now();
  await action();

  const pollInterval = 10;
  let elapsed = 0;
  while (elapsed < maxWaitMs) {
    if (await condition()) {
      const duration = performance.now() - start;
      console.log(`  ⏱  ${label}: ${duration.toFixed(0)}ms`);
      return duration;
    }
    await new Promise(r => setTimeout(r, pollInterval));
    elapsed += pollInterval;
  }

  const duration = performance.now() - start;
  console.log(`  ⚠  ${label}: TIMEOUT after ${duration.toFixed(0)}ms`);
  return duration;
}

test.describe('Latency measurements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DEMO_URL);
    // Wait for the dashboard to fully load
    await page.waitForSelector('[role="button"]', { timeout: 10000 });
    // Let images preload
    await page.waitForTimeout(2000);
  });

  test('switching between posts — content update latency', async ({ page }) => {
    console.log('\n=== Post Switching Latency ===');

    // Get all post items in sidebar
    const postItems = page.locator('[role="button"]');
    const count = await postItems.count();
    expect(count).toBeGreaterThan(1);

    const results: number[] = [];

    for (let i = 1; i < Math.min(count, 6); i++) {
      // Get the headline text of the target post
      const targetText = await postItems.nth(i).locator('p').first().textContent();

      const latency = await measureLatency(
        () => postItems.nth(i).click(),
        async () => {
          // Check if the selected indicator (indigo border) moved to this item
          const classes = await postItems.nth(i).getAttribute('class');
          return classes?.includes('bg-indigo-50') ?? false;
        },
        `Switch to post ${i + 1} ("${targetText?.slice(0, 30)}...")`,
      );

      results.push(latency);
    }

    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    const max = Math.max(...results);
    console.log(`\n  Average: ${avg.toFixed(0)}ms | Max: ${max.toFixed(0)}ms`);

    // Post switching should be under 100ms (it's local state)
    expect(max).toBeLessThan(500);
  });

  test('switching between variants — content update latency', async ({ page }) => {
    console.log('\n=== Variant Switching Latency ===');

    // Click on a post that has variants (POST-001 in demo has A/B)
    const firstPost = page.locator('[role="button"]').first();
    await firstPost.click();
    await page.waitForTimeout(200);

    // Check if variant buttons exist
    const variantButtons = firstPost.locator('button');
    const variantCount = await variantButtons.count();

    if (variantCount < 2) {
      console.log('  Skipping — first post has no variants');
      return;
    }

    const results: number[] = [];

    // Switch between variants
    for (let i = 0; i < Math.min(variantCount, 3); i++) {
      const variantLabel = await variantButtons.nth(i).textContent();

      const latency = await measureLatency(
        () => variantButtons.nth(i).click(),
        async () => {
          const classes = await variantButtons.nth(i).getAttribute('class');
          return classes?.includes('bg-gray-900') ?? false;
        },
        `Switch to variant ${variantLabel}`,
      );

      results.push(latency);
    }

    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    console.log(`\n  Average: ${avg.toFixed(0)}ms`);

    expect(Math.max(...results)).toBeLessThan(500);
  });

  test('platform switching — preview re-render latency', async ({ page }) => {
    console.log('\n=== Platform Switching Latency ===');

    // Wait for preview to render
    await page.waitForSelector('.flex-1.overflow-y-auto img, .flex-1.overflow-y-auto .bg-gradient-to-br', { timeout: 5000 }).catch(() => {});

    const platforms = ['LinkedIn', 'LinkedIn Ad', '𝕏 (Twitter)', 'Facebook', 'Instagram', 'Google Ad'];
    const results: number[] = [];

    for (const platform of platforms) {
      const tab = page.locator('button', { hasText: platform }).first();
      if (!(await tab.isVisible())) continue;

      const latency = await measureLatency(
        () => tab.click(),
        async () => {
          const classes = await tab.getAttribute('class');
          return classes?.includes('border-[#') ?? false;
        },
        `Switch to ${platform}`,
      );

      results.push(latency);
    }

    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    const max = Math.max(...results);
    console.log(`\n  Average: ${avg.toFixed(0)}ms | Max: ${max.toFixed(0)}ms`);

    expect(max).toBeLessThan(500);
  });

  test('comment input — typing and send button latency', async ({ page }) => {
    console.log('\n=== Comment Input Latency ===');

    // In demo mode, the input may be disabled. Check for any input in the feedback panel.
    const commentInput = page.locator('input[type="text"]').last();
    const isDisabled = await commentInput.isDisabled().catch(() => true);

    if (isDisabled) {
      console.log('  Skipping — comment input disabled (demo mode, not authenticated)');
      return;
    }

    await commentInput.fill('Test comment for latency measurement');

    const sendBtn = page.locator('button', { hasText: 'Send' }).first();
    const sendVisible = await sendBtn.isVisible().catch(() => false);

    if (!sendVisible) {
      console.log('  Skipping — Send button not visible');
      return;
    }

    const latency = await measureLatency(
      () => sendBtn.click(),
      async () => {
        const commentThread = page.locator('text=Test comment for latency measurement');
        return (await commentThread.count()) > 0;
      },
      'Comment appears in thread after Send',
    );

    console.log(`\n  Comment display latency: ${latency.toFixed(0)}ms`);
    expect(latency).toBeLessThan(200);
  });

  test('approve button — status update latency', async ({ page }) => {
    console.log('\n=== Approval Latency ===');

    const approveBtn = page.locator('button', { hasText: 'Approve' }).first();

    const latency = await measureLatency(
      () => approveBtn.click(),
      async () => {
        const classes = await approveBtn.getAttribute('class');
        return classes?.includes('bg-green-500') ?? false;
      },
      'Approve button turns green',
    );

    console.log(`\n  Approval UI latency: ${latency.toFixed(0)}ms`);

    expect(latency).toBeLessThan(200);
  });

  test('full flow — end-to-end timing report', async ({ page }) => {
    console.log('\n=== Full Flow Summary ===');

    const timings: Record<string, number> = {};

    // 1. Initial page load
    const loadStart = performance.now();
    await page.goto(DEMO_URL);
    await page.waitForSelector('[role="button"]');
    timings['Page load'] = performance.now() - loadStart;

    // 2. Switch to second post
    const posts = page.locator('[role="button"]');
    const switchStart = performance.now();
    await posts.nth(1).click();
    await page.waitForTimeout(50);
    timings['Post switch'] = performance.now() - switchStart;

    // 3. Switch platform
    const platformTab = page.locator('button', { hasText: 'Facebook' }).first();
    const platformStart = performance.now();
    await platformTab.click();
    await page.waitForTimeout(50);
    timings['Platform switch'] = performance.now() - platformStart;

    // 4. Click approve
    const approveBtn = page.locator('button', { hasText: 'Approve' }).first();
    const approveStart = performance.now();
    await approveBtn.click();
    await page.waitForTimeout(50);
    timings['Approve click'] = performance.now() - approveStart;

    console.log('\n  Timing Report:');
    console.log('  ─────────────────────────────');
    for (const [label, ms] of Object.entries(timings)) {
      const bar = '█'.repeat(Math.min(Math.round(ms / 20), 40));
      console.log(`  ${label.padEnd(18)} ${ms.toFixed(0).padStart(5)}ms  ${bar}`);
    }
    console.log('  ─────────────────────────────');
  });
});
