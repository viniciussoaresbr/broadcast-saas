import {defineConfig} from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // Test files share the same Firestore emulator, so run them serially.
    fileParallelism: false,
    testTimeout: 20000,
  },
});
