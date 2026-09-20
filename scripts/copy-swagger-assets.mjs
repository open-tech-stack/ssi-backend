import { cpSync, mkdirSync } from 'node:fs';

mkdirSync('dist/swagger-ui', { recursive: true });

cpSync('node_modules/swagger-ui-dist', 'dist/swagger-ui', { recursive: true });

console.log('✅ Swagger UI assets copiés dans dist/swagger-ui');
