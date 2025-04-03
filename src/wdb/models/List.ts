import { Model } from '@nozbe/watermelondb'
import { field, text, date, relation, children } from '@nozbe/watermelondb/decorators'

export default class List extends Model {
  static table = 'lists'

  static associations = {
    users: { type: 'belongs_to' as const, key: 'owner_id' },
    items: { type: 'has_many' as const, foreignKey: 'list_id' },
    library_lists: { type: 'has_many' as const, foreignKey: 'list_id' },
  }

  @relation('users', 'owner_id') owner!: any
  @text('title') title!: string
  @text('description') description!: string | null
  @text('cover_image_url') coverImageUrl!: string | null
  @field('is_public') isPublic!: boolean
  @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date

  @children('items') items!: any
  @children('library_lists') libraryLists!: any
} 