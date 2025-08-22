import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testFiles = ['test/auth.test.js', 'test/user.test.js'];

async function runTest(testFile) {
  return new Promise((resolve, reject) => {
    const child = spawn('tsx', ['--test', testFile], {
      stdio: 'inherit',
      cwd: dirname(__dirname),
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${testFile} completed successfully`);
        resolve();
      } else {
        console.log(`❌ ${testFile} failed with code ${code}`);
        reject(new Error(`Test ${testFile} failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      console.log(`❌ Error running ${testFile}:`, error.message);
      reject(error);
    });
  });
}

async function runAllTests() {
  console.log('🧪 Starting all tests sequentially...\n');

  let passed = 0;
  let failed = 0;

  for (const testFile of testFiles) {
    try {
      await runTest(testFile);
      passed++;
    } catch (error) {
      failed++;
      console.log(`\n❌ ${testFile} failed:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Total: ${testFiles.length}`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

runAllTests().catch((error) => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
