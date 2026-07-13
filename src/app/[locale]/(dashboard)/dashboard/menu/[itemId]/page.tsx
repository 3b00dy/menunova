/** SKELETON: single menu-item editor. `params` is async in Next.js 16. */
export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  return <h1 className="text-xl font-semibold">Edit item {itemId}</h1>;
}
