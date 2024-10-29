// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config({
    extends: [
        eslint.configs.recommended,
        ...tseslint.configs.recommendedTypeChecked,
        eslintConfigPrettier,
    ],
    ignores: [
        'dist/',
        'node_modules',
        '*.spec.ts',
        '**/*.spec.ts',
        'tests/',
        '.github',
        '**/*.js',
        '**/*.mjs',
    ],
    languageOptions: {
        parserOptions: {
            project: true,
            tsconfigRootDir: import.meta.dirname,
        },
    },
    rules: {
        'no-console': 'error',
    },
});

// export default tseslint.config(
//     eslint.configs.recommended,
//     ...tseslint.configs.recommendedTypeChecked,
//     {
//         languageOptions: {
//             parserOptions: {
//                 project: true,
//                 tsconfigRootDir: import.meta.dirname,
//             },
//         },
//     },
//     eslintConfigPrettier,
//     {
//         rules: {
//             // 'no-console': 'error',
//         },
//     },
// );

// eslintConfigPrettier should be at the last

// .eslintignore is not supported in flat config as of now there we will use ignores array here.
