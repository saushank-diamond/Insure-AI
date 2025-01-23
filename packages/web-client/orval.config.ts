module.exports = {
  refreshmint: {
    output: {
      mode: "tags-split",
      target: "./src/api",
      schemas: "./src/api/schemas",
      client: "react-query",
      mock: false,
      override: {
        mutator: {
          path: "./src/api/mutator/axios.ts",
          name: "customInstance",
        },
      },
    },
    input: {
      target: "./openapi.json",
    },
  },
};
