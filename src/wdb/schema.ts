import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
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
    tableSchema({
      name: 'folders',
      columns: [
        { name: 'owner_id', type: 'string' },
        { name: 'parentFolderID', type: 'string', isOptional: true },
        { name: 'name', type: 'string' },
        { name: 'createdAt', type: 'number' },
        { name: 'updatedAt', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'lists',
      columns: [
        { name: 'owner_id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'coverImageURL', type: 'string', isOptional: true },
        { name: 'isPublic', type: 'boolean' },
        { name: 'createdAt', type: 'number' },
        { name: 'updatedAt', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'library_lists',
      columns: [
        { name: 'ownerID', type: 'string' },
        { name: 'folderID', type: 'string' },
        { name: 'listID', type: 'string' },
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
    tableSchema({
      name: 'items',
      columns: [
        { name: 'listID', type: 'string' },
        { name: 'title', type: 'string', isOptional: true },
        { name: 'content', type: 'string' },
        { name: 'imageURLs', type: 'string' }, // Stored as JSON string
        { name: 'orderIndex', type: 'number', isOptional: true },
        { name: 'createdAt', type: 'number' },
        { name: 'updatedAt', type: 'number' },
      ],
    }),
  ],
})
