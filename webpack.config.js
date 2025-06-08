const path = require('path');

module.exports = {
    mode: 'development',
    // mode: 'production',
    
    entry: './scripts/index.ts',

    output: {
	path: path.join(__dirname, "docs", "js"),
	filename: "app.js",
	clean: true
    },

    module: {
	rules: [
	    {
		test: /\.ts$/,
		use: 'ts-loader'
	    },
	    {
		test: /\.mustache$/,
		type: 'asset/source'
	    }
	]
    },

    resolve: {
	modules: [
	    "node_modules",
	],
	extensions: [
	    '.ts',
	    '.js'
	]
    }
};
