// this file will be used by default by babel@7 once it is released
module.exports = (api) => {

  api.cache.using(() => {
    // cache based on the two env vars
    return 'babel:' + process.env.BABEL_TARGET +
      ' protractor:' + process.env.IN_PROTRACTOR;
  });

  return {
    "plugins": [
      ["@babel/proposal-decorators", { "legacy": true }],
      ["@babel/proposal-class-properties", { "loose" : true }]
    ],
    "presets": [
      [
        "@babel/react"
      ],
      [
        "@babel/env", {
        "targets": process.env.BABEL_TARGET === 'node' ? {
          "node": process.env.IN_PROTRACTOR ? '6' : 'current'
        } : {
          "browsers": [
            "last 2 versions"
          ]
        },
        "loose": true,
        "modules": process.env.BABEL_TARGET === 'node' ? 'commonjs' : false,
        "useBuiltIns": false
      }
      ]
    ]
  }
};
