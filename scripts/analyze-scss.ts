#!/usr/bin/env tsx
// scripts/analyze-scss.ts
import path from 'path';
import { scssUnusedAnalyzer } from '../config/vite/plugins/scssUnusedAnalyzer';

async function main() {
  const srcPath = path.resolve(__dirname, '../src');

  console.log('🔍 Запуск глубокого анализа SCSS...\n');

  const plugin = scssUnusedAnalyzer({
    srcPath,
    isDev: false, // Строгий режим
  });

  await (plugin as any).buildStart();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
