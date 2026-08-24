// config/vite/plugins/scssUnusedAnalyzer.ts
import fs from 'fs/promises';
import { globby } from 'globby';
import path from 'path';
import { Plugin } from 'vite';

interface ScssUnusedAnalyzerOptions {
  srcPath: string;
  isDev: boolean;
}

export function scssUnusedAnalyzer(options: ScssUnusedAnalyzerOptions): Plugin {
  const { srcPath, isDev } = options;

  // ✅ Whitelist для системных миксинов
  const whitelist = [
    'max-xs',
    'max-sm',
    'max-md',
    'max-lg',
    'max-xl',
    'min-xs',
    'min-sm',
    'min-md',
    'min-lg',
    'min-xl',
    'container',
    'flex-start',
    'flex-center',
    'flex-between',
    'font-light',
    'font-normal',
    'font-medium',
    'font-semibold',
    'font-bold',
  ];

  const patterns = {
    varDecl: /(\$[\w-]+)\s*:\s*([^;]+);/g,
    mixinDecl: /@mixin\s+([\w-]+)/g,
    funcDecl: /@function\s+([\w-]+)/g,
    varUsage: /(\$[\w-]+)/g,
    // ✅ Поддерживает namespace: @include mixins.container
    mixinUsage: /@include\s+(?:[\w-]+\.)*([\w-]+)\s*(?:\(|;|{)/g,
  };

  async function analyze() {
    console.log('\n\x1b[36m%s\x1b[0m', '🔍 [SCSS Analyzer] Сканирование...');
    const start = Date.now();

    const scssFiles = await globby('**/*.scss', {
      cwd: srcPath,
      ignore: ['node_modules', 'dist', 'build'],
    });

    const declarations = new Map<
      string,
      { file: string; line: number; type: 'var' | 'mixin' | 'func' }
    >();
    const usages = new Set<string>();

    for (const file of scssFiles) {
      const fullPath = path.join(srcPath, file);
      const content = await fs.readFile(fullPath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        if (line.trim().startsWith('//')) return;

        let match;
        while ((match = patterns.varDecl.exec(line)) !== null) {
          if (!match[1].startsWith('$sass-')) {
            declarations.set(match[1], { file, line: idx + 1, type: 'var' });
          }
        }
        while ((match = patterns.mixinDecl.exec(line)) !== null) {
          declarations.set(match[1], { file, line: idx + 1, type: 'mixin' });
        }
        while ((match = patterns.funcDecl.exec(line)) !== null) {
          declarations.set(match[1], { file, line: idx + 1, type: 'func' });
        }

        // ✅ Собираем использования с поддержкой namespace
        for (const m of line.matchAll(patterns.varUsage)) usages.add(m[1]);
        for (const m of line.matchAll(patterns.mixinUsage)) usages.add(m[1]);
      });
    }

    const unused: string[] = [];
    declarations.forEach((info, name) => {
      if (name.startsWith('$_')) return;
      if (whitelist.includes(name)) return; // ✅ Пропускаем системные

      if (!usages.has(name)) {
        unused.push(`[${info.type.toUpperCase()}] ${name} в ${info.file}:${info.line}`);
      }
    });

    const duration = Date.now() - start;

    if (unused.length > 0) {
      console.warn(
        '\x1b[33m%s\x1b[0m',
        `⚠️ [SCSS Analyzer] Найдено ${unused.length} неиспользуемых элементов за ${duration}мс:`
      );
      unused.forEach((item) => console.warn(`   ${item}`));
    } else {
      console.log('\x1b[32m%s\x1b[0m', '✅ [SCSS Analyzer] Мертвый код не найден');
    }
  }

  return {
    name: 'vite-plugin-scss-unused-analyzer',
    enforce: 'post',
    async buildStart() {
      await analyze();
    },
  };
}
