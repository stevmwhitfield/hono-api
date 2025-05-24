import configs from '@evix-oss/eslint-config';

export default [
    ...configs.recommended,
    {
        rules: {
            'no-undefined': 'off',
        },
    },
];
