module.exports = {
  directory: ["./components/", "./app/"],
  entrypoints: [
    "./app/layout.tsx",
    "./app/page.tsx",
    "./app/all/page.tsx",
    "./app/bitcoin/page.jsx",
    "./app/charity/[nickname]/page.tsx",
    "./app/(chat)/page.tsx",
    "./app/submit/page.tsx",
  ],
  extensions: [".js", ".jsx", ".ts", ".tsx"],
  exclude: ["node_modules", ".next", "**/*.test.*", "**/*.spec.*"],
};
