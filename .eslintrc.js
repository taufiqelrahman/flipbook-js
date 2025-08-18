module.exports = {
	'env': {
		'browser': true,
		'node': true,
    "amd": true
	},
	'extends': ['eslint:recommended','plugin:prettier/recommended'],
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly'
	},
	'parserOptions': {
		'ecmaVersion': 2018,
		'sourceType': 'module'
	},
	'rules': {},
};