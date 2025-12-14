// apps/web-app/vitest.config.ts
import { defineConfig } from "file:///home/runner/work/Polyglottos/Polyglottos/apps/web-app/node_modules/vitest/dist/config.js";
import react from "file:///home/runner/work/Polyglottos/Polyglottos/apps/web-app/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { nxViteTsPaths } from "file:///home/runner/work/Polyglottos/Polyglottos/node_modules/@nx/vite/plugins/nx-tsconfig-paths.plugin.js";
import { nxCopyAssetsPlugin } from "file:///home/runner/work/Polyglottos/Polyglottos/node_modules/@nx/vite/plugins/nx-copy-assets.plugin.js";
import path from "path";
var __vite_injected_original_dirname = "/home/runner/work/Polyglottos/Polyglottos/apps/web-app";
var vitest_config_default = defineConfig({
  root: __vite_injected_original_dirname,
  cacheDir: "../../node_modules/.vite/apps/web-app",
  plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(["*.md"])],
  resolve: {
    alias: {
      "~": path.resolve(__vite_injected_original_dirname, "app")
    }
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  test: {
    setupFiles: ["test-setup.ts"],
    watch: false,
    globals: true,
    environment: "jsdom",
    include: ["./tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "../../coverage/apps/web-app",
      provider: "v8"
    }
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiYXBwcy93ZWItYXBwL3ZpdGVzdC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9ydW5uZXIvd29yay9Qb2x5Z2xvdHRvcy9Qb2x5Z2xvdHRvcy9hcHBzL3dlYi1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3J1bm5lci93b3JrL1BvbHlnbG90dG9zL1BvbHlnbG90dG9zL2FwcHMvd2ViLWFwcC92aXRlc3QuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3J1bm5lci93b3JrL1BvbHlnbG90dG9zL1BvbHlnbG90dG9zL2FwcHMvd2ViLWFwcC92aXRlc3QuY29uZmlnLnRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9J3ZpdGVzdCcgLz5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGVzdC9jb25maWcnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCB7IG54Vml0ZVRzUGF0aHMgfSBmcm9tICdAbngvdml0ZS9wbHVnaW5zL254LXRzY29uZmlnLXBhdGhzLnBsdWdpbic7XG5pbXBvcnQgeyBueENvcHlBc3NldHNQbHVnaW4gfSBmcm9tICdAbngvdml0ZS9wbHVnaW5zL254LWNvcHktYXNzZXRzLnBsdWdpbic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcm9vdDogX19kaXJuYW1lLFxuICBjYWNoZURpcjogJy4uLy4uL25vZGVfbW9kdWxlcy8udml0ZS9hcHBzL3dlYi1hcHAnLFxuICBwbHVnaW5zOiBbcmVhY3QoKSwgbnhWaXRlVHNQYXRocygpLCBueENvcHlBc3NldHNQbHVnaW4oWycqLm1kJ10pXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnfic6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdhcHAnKSxcbiAgICB9LFxuICB9LFxuICAvLyBVbmNvbW1lbnQgdGhpcyBpZiB5b3UgYXJlIHVzaW5nIHdvcmtlcnMuXG4gIC8vIHdvcmtlcjoge1xuICAvLyAgcGx1Z2luczogWyBueFZpdGVUc1BhdGhzKCkgXSxcbiAgLy8gfSxcbiAgdGVzdDoge1xuICAgIHNldHVwRmlsZXM6IFsndGVzdC1zZXR1cC50cyddLFxuICAgIHdhdGNoOiBmYWxzZSxcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIGVudmlyb25tZW50OiAnanNkb20nLFxuICAgIGluY2x1ZGU6IFsnLi90ZXN0cy8qKi8qLnt0ZXN0LHNwZWN9LntqcyxtanMsY2pzLHRzLG10cyxjdHMsanN4LHRzeH0nXSxcbiAgICByZXBvcnRlcnM6IFsnZGVmYXVsdCddLFxuICAgIGNvdmVyYWdlOiB7XG4gICAgICByZXBvcnRzRGlyZWN0b3J5OiAnLi4vLi4vY292ZXJhZ2UvYXBwcy93ZWItYXBwJyxcbiAgICAgIHByb3ZpZGVyOiAndjgnLFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsU0FBUyxxQkFBcUI7QUFDOUIsU0FBUywwQkFBMEI7QUFDbkMsT0FBTyxVQUFVO0FBTGpCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sd0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFVBQVU7QUFBQSxFQUNWLFNBQVMsQ0FBQyxNQUFNLEdBQUcsY0FBYyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQUEsRUFDaEUsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsS0FBSztBQUFBLElBQ3BDO0FBQUEsRUFDRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLQSxNQUFNO0FBQUEsSUFDSixZQUFZLENBQUMsZUFBZTtBQUFBLElBQzVCLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFNBQVMsQ0FBQywwREFBMEQ7QUFBQSxJQUNwRSxXQUFXLENBQUMsU0FBUztBQUFBLElBQ3JCLFVBQVU7QUFBQSxNQUNSLGtCQUFrQjtBQUFBLE1BQ2xCLFVBQVU7QUFBQSxJQUNaO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
