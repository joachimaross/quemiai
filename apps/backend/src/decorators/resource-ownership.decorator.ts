import { SetMetadata } from '@nestjs/common';

export const RESOURCE_KEY = 'resource';
export const OWNERSHIP_KEY = 'ownershipCheck';

/**
 * Decorator to enforce resource ownership checks
 * @param resourceType - Type of resource (e.g., 'post', 'comment')
 * @param ownershipCheck - Function that checks if user owns the resource
 * @example
 * @ResourceOwnership('post', async (userId, postId) => {
 *   const post = await prisma.post.findUnique({ where: { id: postId } });
 *   return post?.userId === userId;
 * })
 * @UseGuards(JwtAuthGuard, ResourceOwnershipGuard)
 * async updatePost(@Param('id') id: string) { ... }
 */
export const ResourceOwnership = (
  resourceType: string,
  ownershipCheck: (userId: string, resourceId: string) => Promise<boolean>,
) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(RESOURCE_KEY, resourceType)(target, propertyKey, descriptor);
    SetMetadata(OWNERSHIP_KEY, ownershipCheck)(target, propertyKey, descriptor);
  };
};
