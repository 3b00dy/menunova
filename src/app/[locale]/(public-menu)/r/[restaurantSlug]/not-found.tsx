/** Shown when a restaurant slug does not resolve to a tenant. */
export default function RestaurantNotFound() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Restaurant not found</h1>
      <p className="text-black/60 dark:text-white/60">
        This menu link is invalid or the restaurant is no longer available.
      </p>
    </div>
  );
}
