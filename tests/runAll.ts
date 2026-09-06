import { runModule1Tests } from './test_module1';
import { runModule2Tests } from './test_module2';
import { runModule3Tests } from './test_module3';
import { clearAllScansInDb } from '../src/db/database';

async function runAllTests() {
  console.log('================================================================');
  console.log('  PHISHSHIELD SECURITY ENGINE - 3-MODULE ACADEMIC TEST SUITE   ');
  console.log('================================================================\n');

  try {
    runModule1Tests();
    await runModule2Tests();
    await runModule3Tests();

    // Reset database to pristine empty state for real user evaluation
    await clearAllScansInDb();

    console.log('================================================================');
    console.log('  ALL 3 MODULES TEST CASES PASSED WITH 100% SUCCESS! ✓         ');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err);
    process.exit(1);
  }
}

runAllTests();
