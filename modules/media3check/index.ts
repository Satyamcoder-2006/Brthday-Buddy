// Reexport the native module. On web, it will be resolved to Media3TransformerModule.web.ts
// and on native platforms to Media3TransformerModule.ts
export { default } from './src/Media3TransformerModule';
export { default as Media3TransformerView } from './src/Media3TransformerView';
export * from  './src/Media3Transformer.types';
