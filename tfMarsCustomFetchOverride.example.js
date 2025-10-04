alert(1);
const resolve = window.tfMarsFetchOverrideMiddlewares[0];
window.tfMarsFetchOverrideMiddlewares.push((ctx) => {
  console.log(ctx);
});
resolve();
