import { Model } from '@nozbe/watermelondb'
import { field, text, date, relation } from '@nozbe/watermelondb/decorators'

export default class Folder extends Model {
  static table = 'folders'

  static associations = {
    users: { type: 'belongs_to' as const, key: 'owner_id' },
    parent_folders: { type: 'belongs_to' as const, key: 'parent_folder_id' },
    library_lists: { type: 'has_many' as const, foreignKey: 'folder_id' },
  }

  @relation('users', 'owner_id') owner!: any
  @relation('folders', 'parent_folder_id') parentFolder!: any
  @text('name') name!: string
  @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date
} 