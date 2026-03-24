import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    dedupe: [
      '@angular/core',
      '@angular/common',
      '@ngx-translate/core',
      'primeng',
      'rxjs',
      'zone.js',
    ],
  },
});
