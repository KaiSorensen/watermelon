import { schemaMigrations, createTable } from '@nozbe/watermelondb/Schema/migrations'

export default schemaMigrations({
  migrations: [
    {
      toVersion: 1,
      steps: [
        createTable({
          name: 'users',
          columns: [
            { name: 'username', type: 'string' },
            { name: 'email', type: 'string' },
            { name: 'avatarURL', type: 'string', isOptional: true },
            { name: 'notifsEnabled', type: 'boolean' },
            { name: 'createdAt', type: 'number' },
            { name: 'updatedAt', type: 'number' },
          ],
        }),
        createTable({
          name: 'folders',
          columns: [
            { name: 'ownerID', type: 'string', isIndexed: true },
            { name: 'parentFolderID', type: 'string', isOptional: true, isIndexed: true },
            { name: 'name', type: 'string' },
            { name: 'createdAt', type: 'number' },
            { name: 'updatedAt', type: 'number' },
          ],
        }),
        createTable({
          name: 'lists',
          columns: [
            { name: 'ownerID', type: 'string', isIndexed: true },
            { name: 'title', type: 'string' },
            { name: 'description', type: 'string', isOptional: true },
            { name: 'coverImageURL', type: 'string', isOptional: true },
            { name: 'isPublic', type: 'boolean' },
            { name: 'createdAt', type: 'number' },
            { name: 'updatedAt', type: 'number' },
          ],
        }),
        createTable({
          name: 'librarylists',
          columns: [
            { name: 'ownerID', type: 'string', isIndexed: true },
            { name: 'folderID', type: 'string', isIndexed: true },
            { name: 'listID', type: 'string', isIndexed: true },
            { name: 'orderIndex', type: 'number' },
            { name: 'sortOrder', type: 'string' },
            { name: 'today', type: 'boolean' },
            { name: 'currentItem', type: 'string', isOptional: true },
            { name: 'notifyOnNew', type: 'boolean' },
            { name: 'notifyTime', type: 'number', isOptional: true },
            { name: 'notifyDays', type: 'string', isOptional: true },
            { name: 'createdAt', type: 'number' },
            { name: 'updatedAt', type: 'number' },
          ],
        }),
        createTable({
          name: 'items',
          columns: [
            { name: 'listID', type: 'string', isIndexed: true },
            { name: 'title', type: 'string', isOptional: true },
            { name: 'content', type: 'string' },
            { name: 'imageURLs', type: 'string' },
            { name: 'orderIndex', type: 'number', isOptional: true },
            { name: 'createdAt', type: 'number' },
            { name: 'updatedAt', type: 'number' },
          ],
        }),
      ],
    },
  ],
})
